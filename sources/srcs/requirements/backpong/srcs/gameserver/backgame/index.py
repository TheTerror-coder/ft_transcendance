import socketio
import asyncio
import os
import random
import math
from .Player import Player
from .Team import Team
from .Channel import Channel
from .Tournament import Tournament
from .Game import Game
import logging
import sys
from gameserver.parameters import EnvVariables

# Configuration du logging au début du fichier
logging.basicConfig(
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)


# Création du serveur Socket.IO
sio = socketio.AsyncServer(
    cors_allowed_origins=[
        f'wss://localhost:{EnvVariables.PROXYWAF_HTTPS_PORT}',
		f'wss://{EnvVariables.HOST_IP}:{EnvVariables.PROXYWAF_HTTPS_PORT}',
		f'ws://localhost:{EnvVariables.GAMESERVER_PORT}',
		f'ws://{EnvVariables.HOST_IP}:{EnvVariables.GAMESERVER_PORT}',
        
        f'https://localhost:{EnvVariables.PROXYWAF_HTTPS_PORT}',
		f'https://{EnvVariables.HOST_IP}:{EnvVariables.PROXYWAF_HTTPS_PORT}',
		f'http://localhost:{EnvVariables.GAMESERVER_PORT}',
		f'http://{EnvVariables.HOST_IP}:{EnvVariables.GAMESERVER_PORT}',
    ],
    cors_credentials=True,
    async_mode='asgi',
    ping_timeout=60000,
    ping_interval=25000,
    transports=['websocket'],
)

logger.info("**********Server started***********")

ChannelList = {}
tournamentGame = {}
active_games = {}
player_rooms = {}

def generateGameCode():
    return str(random.randint(1000, 9999))

@sio.event
async def disconnect(sid):
    logger.info(f'Client disconnected: {sid}')
    
    if sid in player_rooms:
        rooms_to_process = set(player_rooms[sid])
        for room in rooms_to_process:
            logger.info(f'Cleaning up room {room} for player {sid}')
            await sio.leave_room(sid, room)

            # Initialisation des variables
            channel = None
            game = None

            # Récupération du channel et du game
            if room in ChannelList:
                channel = ChannelList[room]
                if channel.getIsTournament():
                    tournament = channel.getTournament()
                    if room in tournamentGame:
                        game = tournamentGame[room]
                else:
                    game = channel.getGame()
            
            # Gestion du tournoi
            if channel and channel.getIsTournament():
                tournament = channel.getTournament()
                
                if not tournament.getStart():
                    disconnected_team = None
                    opponent_team = None
                    
                    if channel and channel.getCreator() == sid:
                        await sio.emit('error', {'message': 'Creator leave the room, you will be disconnected soon', 'ErrorCode': 2}, room=room)
                        break
                    # Trouver le match en cours pour ce joueur et verifier si l'autre joueur est déjà déconnecté
                    current_match = tournament.findMatchByPlayerId(sid)
                    if current_match:
                        team1, team2 = current_match
                        other_team = team2 if team1.getTournamentTeamId() == sid else team1
                        other_player_id = other_team.getTournamentTeamId()
                        
                        # Si l'autre joueur n'est plus connecté
                        if not sio.manager.rooms.get('/', {}).get(other_player_id):
                            logger.info(f"Les deux joueurs sont déconnectés pour le match {room}")
                            gameCode = tournament.findGameByTeams(team1.getTournamentTeamId(), team2.getTournamentTeamId())
                            if gameCode and gameCode in tournamentGame:
                                game = tournamentGame[gameCode]
                                game.gameStarted = False
                                game.setGameInLobby(False)
                                tournament.removeTournamentGame(game)
                                del tournamentGame[gameCode]
                            
                            # Supprimer les deux équipes
                            tournament.removeTournamentTeam(team1)
                            tournament.removeTournamentTeam(team2)
                            # await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=room)
                            
                            logger.info(f"tournament.tournamentTeams {tournament.tournamentTeams}")
                            return
                        
                        # Identifier quelle équipe se déconnecte
                        if team1.getTournamentTeamId() == sid:
                            disconnected_team = team1
                            opponent_team = team2
                        elif team2.getTournamentTeamId() == sid:
                            disconnected_team = team2
                            opponent_team = team1
                            
                        if disconnected_team and opponent_team:
                            # Supprimer uniquement la partie spécifique du tournoi
                            gameCode = tournament.findGameByTeams(team1.getTournamentTeamId(), team2.getTournamentTeamId())
                            if gameCode and gameCode in tournamentGame:
                                game = tournamentGame[gameCode]
                                game.gameStarted = False
                                game.setGameInLobby(False)
                                tournament.removeTournamentGame(game)
                                del tournamentGame[gameCode]
                            
                            # Mettre à jour l'arbre du tournoi pour ce match spécifique
                            tournament.removeTournamentTeam(disconnected_team)
                            tournament.updateTournamentTree(opponent_team)
                            if (len(tournament.tournamentTeams) == 1):
                                winner_team = next(iter(tournament.tournamentTeams.values()))
                                await sio.emit('tournamentWinner', winner_team.getName(), room=room)
                                logger.info(f"Tournament {room} ended with winner {winner_team.getName()}")
                                await sio.emit('tournamentEnded', room=room)
                            return
                    else:
                        tournament.removeTournamentTeam(tournament.getTournamentTeams(sid))
                        await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=room)
            
            # Gestion du jeu
            if game:
                game.removeNbPlayerConnected()
                game.removePlayerReady()
                
                for team in game.teams.values():
                    player = team.getPlayerById(sid)
                    if player:
                        player.setOnline(False)
                        player.setAllowedToReconnect(True)
                        
                        # Gestion du lobby
                        if game.getGameInLobby():
                            game.removeNbPlayerInLobby(1)
                            team.removePlayer(sid)
                            team.setIsFull()
                            
                            if channel and channel.getCreator() == sid:
                                await sio.emit('error', {'message': 'Creator leave the room, you will be disconnected soon', 'ErrorCode': 2}, room=room)
                                break
                                
                            await sio.emit('TeamsNotFull', room=room)
                            await sendPlayerLists(game, room, sid)
                            
                        # Gestion partie en cours
                        elif game.gameStarted and game.nbPlayerConnected > 0:
                            game.gameStarted = False
                            game.setIsPaused(True)
                            await sio.emit('gamePaused', room=room)
                            logger.info(f'Game {room} paused because player {sid} disconnected')
                            
                            if game.getIsGameTournament():
                                # Forfait immédiat pour les parties de tournoi
                                otherTeam = None
                                for t in game.teams.values():
                                    if not t.getPlayerById(sid):
                                        otherTeam = t
                                        break
                                
                                if otherTeam:
                                    # await sio.emit('tournamentWinner', otherTeam.getName(), room=room)
                                    await handle_tournament_end(game, room)
                                    if room in tournamentGame:
                                        tournamentGame.pop(room)
                            else:
                                # Timer pour les parties normales
                                await game.handle_disconnect(sid, sio, room)
                            break
                        break
                
                # Nettoyage si plus personne dans la partie
                if game.nbPlayerConnected == 0 and (not game.getGameInLobby() or game.getNbPlayerInLobby() == 0):
                    await cleanup_game(room, game)
                    logger.info(f'Regular game cleanup for {room}')
        
        del player_rooms[sid]

async def cleanup_game(gameCode, game):
    logger.info(f"Cleaning up game {gameCode}")
    game.gameStarted = False
    
    while (not game.payloadSend):
        await asyncio.sleep(1)

    for team in game.teams.values():
        for player in list(team.player.values()):
            if player.getId() in player_rooms:
                await sio.leave_room(player.getId(), gameCode)
            if not game.getIsGameTournament():
                team.removePlayer(player.getId())
    
    await sio.close_room(gameCode)
    if gameCode in ChannelList:
        ChannelList.pop(gameCode)
    if gameCode in active_games:
        active_games.pop(gameCode)

def findGame(gameCode, originalGameCode):
    if gameCode in ChannelList or originalGameCode in ChannelList:
        if (originalGameCode is None):
            return ChannelList[gameCode].getGame()
        if (ChannelList[gameCode].getIsTournament()):
            tournament = ChannelList[gameCode].getTournament()
            game = tournament.getTournamentGames(originalGameCode)
        else:
            channel = ChannelList[gameCode]
            game = channel.getGame()
        if (not game):
            logger.info(f"Game {gameCode} / {originalGameCode} not found")
            return None
        return game
    logger.info(f"Game {gameCode} / {originalGameCode} not found")
    return None

# Connexion to server event
@sio.event
async def connect(sid, environ=None, auth=None):
    logger.info(f'Client connected: {sid}')
    player_rooms[sid] = set()

# Event To create a Tournament
@sio.event
async def createTournament(sid, data):
    logger.info(f"createTournament {sid}, {data}")
    tournamentCode = generateGameCode()
    while tournamentCode in ChannelList:
        tournamentCode = generateGameCode()

    logger.info(f"Tournament code : {tournamentCode}")
    channel = Channel(tournamentCode, sid, True)
    ChannelList[tournamentCode] = channel
    tournament = channel.getTournament()
    tournament.addTournamentTeam(Team(data.get('teamName'), 1, sid, None), sid)
    logger.info(f"tournament.getNbTeam() dans createTournament dans index.py {tournament.getNbTeam()}")
    await sio.enter_room(sid, tournamentCode)
    player_rooms[sid].add(tournamentCode)
    await sio.emit('tournamentCreated', {'tournamentCode': tournamentCode, 'creator': sid}, room=sid)
    await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)

# Event to join a tournament
@sio.event
async def joinTournament(sid, data):
    logger.info(f"joinTournament {sid}, {data}")
    tournamentCode = data.get('tournamentCode')
    if tournamentCode in ChannelList:
        channel = ChannelList[tournamentCode]
        tournament = channel.getTournament()
        if (not channel.getIsTournament()):
            await sio.emit('error', {'message': 'This is not a tournament code', 'ErrorCode': 1}, room=sid)
            return
        if (tournament.getIsFull()):
            await sio.emit('error', {'message': 'Tournament is full', 'ErrorCode': 1}, room=sid)
            return
        if (tournament.getStart()):
            await sio.emit('error', {'message': 'Tournament already started', 'ErrorCode': 1}, room=sid)
            return
        if tournament.getNbTeam() < 4:
            tournament.addTournamentTeam(Team(data.get('teamName'), 1, sid, None), sid)
            logger.info(f"tournament.getNbTeam() dans joinTournament dans index.py {tournament.getNbTeam()}")
            await sio.enter_room(sid, tournamentCode)
            player_rooms[sid].add(tournamentCode)
            await sio.emit('tournamentJoined', {'tournamentCode': tournamentCode, 'creator': channel.getCreator()}, room=sid)
            await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)
            if (tournament.getNbTeam() == 4):
                tournament.setIsFull(True)
                logger.info(f"Starting tournament {tournamentCode}")
                sio.emit('tournamentFull', room=tournamentCode)
                await startTournament(sio, tournament, tournamentCode, True)
        else:
            await sio.emit('error', {'message': 'Tournament is full', 'ErrorCode': 1}, room=sid)
    else:
        logger.info(f"Tournament not found")
        await sio.emit('error', {'message': 'Tournament not found', 'ErrorCode': 1}, room=sid)

# Event to create a normal game (1v1 or 2v2)
@sio.event
async def createGame(sid, data):
    logger.info(f"createGame {sid}, {data}")
    numPlayersPerTeam = data.get('numPlayersPerTeam')
    gameCode = generateGameCode()
    while gameCode in ChannelList:
        gameCode = generateGameCode()

    channel = Channel(gameCode, sid, False)
    ChannelList[gameCode] = channel
    game = channel.getGame()
    game.setNbPlayerPerTeam(int(numPlayersPerTeam))
    if game.getNbPlayerPerTeam() == 2:
        game.WINNING_SCORE = 10
    
    team1 = Team("Black-Beard", int(numPlayersPerTeam), None, 1)
    team2 = Team("White-Beard", int(numPlayersPerTeam), None, 2)
    
    team1.TournamentTeamId = None
    team2.TournamentTeamId = None
    
    game.setTeam(team1)
    game.setTeam(team2)
    
    await sio.enter_room(sid, gameCode)
    player_rooms[sid].add(gameCode)
    await sio.emit('gameCreated', {'gameCode': gameCode, 'creator': sid}, room=sid)
    asyncio.create_task(game.launchCheckGameFull(sio, gameCode))
    await updateGameOptions(game, gameCode, sid)

# Event to confirme the choices of role or team (1v1 or 2v2)
@sio.event
async def confirmChoicesCreateGame(sid, choices):
    logger.info(f"confirmChoicesCreateGame {sid}, {choices}")
    gameCode = choices.get('gameCode')
    logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role for the game {gameCode}.")
    if (gameCode in ChannelList):
        channel = ChannelList[gameCode]
        game = channel.getGame()
        if (not game):
            await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)
            return
        team = game.getTeam(int(choices['teamID']))
        if team:
            team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
            team.getPlayerById(sid).setOnline(True)
            game.addNbPlayerInLobby()
            await sendPlayerLists(game, gameCode, sid)
        else:
            logger.info("Équipe non trouvée")
            await sio.emit('error', {'message': 'Équipe non trouvée', 'ErrorCode': 1}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)

# Event to join a narmal game (1v1 2v2)
@sio.event
async def joinGame(sid, data):
    logger.info(f"joinGame {sid}, {data}")
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        logger.info(f"Player {sid} joined game {gameCode}")
        channel = ChannelList[gameCode]
        if (channel.getIsTournament()):
            await sio.emit('error', {'message': 'This is not a normal game code', 'ErrorCode': 1}, room=sid)
            return
        game = channel.getGame()
        
        team1 = game.getTeam(1)
        team2 = game.getTeam(2)
        if (team1.getIsFull() and team2.getIsFull()) and game.getIsPaused() == False:
            await sio.emit('error', {'message': 'Partie pleine', 'ErrorCode': 1}, room=sid)
            return
            
        await sio.enter_room(sid, gameCode)
        player_rooms[sid].add(gameCode)
        await sio.emit('gameJoined', {'gameCode': gameCode, 'nbPlayerPerTeam': game.getNbPlayerPerTeam(), 'creator': channel.getCreator() }, room=sid)
        await updateGameOptions(game, gameCode, sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)

# Event to confirme the choices when join a normal game (1v1 or 2v2)
@sio.event
async def confirmChoicesJoinGame(sid, choices):
    gameCode = choices.get('gameCode')
    logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role for the game {gameCode}.")
    if (gameCode in ChannelList):
        channel = ChannelList[gameCode]
        if (channel.getIsTournament()):
            await sio.emit('error', {'message': 'This is not a normal game code', 'ErrorCode': 1}, room=sid)
            return
        game = channel.getGame()
        if (not game):
            await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)
            return
        if (game.findTeamByPlayerName(choices['userName'])):
            team = game.findTeamByPlayerName(choices['userName'])
        else:
            if (not checkGameOptions(game, gameCode, sid, choices)):
                await sio.emit('error', {'message': 'Error : Invalid choices', 'ErrorCode': 1}, room=sid)
                return
        team = game.getTeam(int(choices['teamID']))
        if team:
            if game.getPlayerByName(choices['userName']):
                player = game.getPlayerByName(choices['userName'])
                logger.info(f"Player {sid} found in game {gameCode}. Reconnecting player to team {player.getTeamID()}")
                player.setOnline(True)
                player.setId(sid)
                if (not game.handle_reconnect(sid)):
                    await sio.emit('error', {'message': 'Error : This game is have been ended because of your 30 seconds disconnection... Or 10 if your buddy disconnected too', 'ErrorCode': 1}, room=sid)
                    sio.disconnect(sid)
                    return
            else:
                logger.info(f"Player {sid} not found in game {gameCode}. Adding player to team {int(choices['teamID'])}")
                team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
                team.getPlayerById(sid).setOnline(True)
            game.addNbPlayerInLobby()
            await sendPlayerLists(game, gameCode, sid)
            if (game.getIsPaused()):
                for team in game.teams.values():
                    for player in team.player.values():
                        if (player.getId() == sid):
                            player.setOnline(True)
                            player.setAllowedToReconnect(False)
                            await asyncio.sleep(5)
                            await sio.emit('startGame', room=sid)
                            logger.info(f"startGame sent to {sid}")
                            return
        else:
            await sio.emit('error', {'message': 'Équipe non trouvée', 'ErrorCode': 1}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)

@sio.event
async def launchGame(sid, gameCode):
    if gameCode in ChannelList:
        if (ChannelList[gameCode].getIsTournament()):
            tournament = ChannelList[gameCode].getTournament()
            game = tournament.getTournamentGames(gameCode)
        else:
            channel = ChannelList[gameCode]
            game = channel.getGame()
        if (not game):
            return
        if (game.getIsLaunch()):
            return
        if game.getTeam(1).getIsFull() and game.getTeam(2).getIsFull():
            if channel.getCreator() == sid:
                logger.info(f"Starting game {gameCode} in launchGame")
                await sio.emit('startGame', room=gameCode)
                game.setIsLaunch(True)
                # if (not game.getPlayerById(sid).getIsLaunch()):
            else:
                await sio.emit('error', {'message': 'Vous n\'êtes pas le créateur de la partie', 'ErrorCode': 0}, room=sid)
        else:
            await sio.emit('error', {'message': 'Toutes les équipes ne sont pas pleines', 'ErrorCode': 0}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)

@sio.event
async def playerReady(sid, gameCode):
    logger.info(f"playerReady {gameCode}, {sid}")
    originalGameCode = None
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]

    game = findGame(gameCode, originalGameCode)
    if (not game):
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)
        return
    game.addPlayerReady()
    for team in game.teams.values():
        if (team.getPlayerById(sid)):
            team.getPlayerById(sid).setIsInit(True)
    if (game.getIsGameTournament()):
        await ReadyToStart(originalGameCode, game)
    else:
        await ReadyToStart(gameCode, game)

@sio.event
async def GameStarted(sid, gameCode):
    logger.info(f"GameStarted {gameCode}")
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]
        isTournament = True
    else:
        originalGameCode = None
        isTournament = False

    game = findGame(gameCode, originalGameCode)
    if (not game):
        return
    game.addNbPlayerConnected()
    if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
        if (game.getIsPaused()):
            await game.sendGameData(sio, gameCode, sid, originalGameCode, isTournament)
        else:
            await game.sendGameData(sio, gameCode, None, originalGameCode, isTournament)
    else:
        logger.info(f"Game {gameCode} / {originalGameCode} not started because not enough players connected, {game.nbPlayerConnected} / {game.nbPlayerPerTeam * 2}")
        game.gameStarted = False

@sio.event
async def ClientData(sid, data):
    gameCode = data.get('gameCode')
    logger.info(f"ClientData {gameCode}")
    originalGameCode = None
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]

    game = findGame(gameCode, originalGameCode)
    if (not game):
        await sio.emit('error', {'message': 'Partie non trouvée', 'ErrorCode': 1}, room=sid)
        return
    await game.updateClientData(data)

@sio.event
async def cannonPosition(sid, data):
    gameCode = data.get('gameCode')
    originalGameCode = None
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]

    game = findGame(gameCode, originalGameCode)
    if (not game):
        return
    await game.updateCannonPosition(data['team'], data['cannonPosition']['x'])
    await sio.emit('cannonPosition', {
        'teamID': data['team'],
        'cannonPosition': data['cannonPosition']
    }, room=gameCode, skip_sid=sid)

@sio.event
async def boatPosition(sid, data):
    gameCode = data.get('gameCode')
    originalGameCode = None
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]

    game = findGame(gameCode, originalGameCode)
    if (not game):
        return
    await game.updateBoatPosition(data['team'], data['boatPosition']['x'])
    if (game.getIsGameTournament()):
        await sio.emit('boatPosition', {
            'teamID': data['team'],
            'boatPosition': data['boatPosition'],
            'sid': sid
        }, room=originalGameCode, skip_sid=sid)
    else:
        await sio.emit('boatPosition', {
            'teamID': data['team'],
            'boatPosition': data['boatPosition'],
            'sid': sid
        }, room=gameCode, skip_sid=sid)

@sio.event
async def BallFired(sid, data):
    gameCode = data.get('gameCode')
    team = data.get('team')

    game = findGame(gameCode, None)
    if (not game):
        return

    await sio.emit('ballFired', data['trajectory'], room=gameCode, skip_sid=sid)
    
    collision_result = await game.updateBallFired(data)
    
    if collision_result == 1:
        logger.info(f"Collision detected for game {gameCode}, waiting for animation to complete")
    elif collision_result == -1:
        logger.error(f"Error in updateBallFired for game {gameCode}")

@sio.event
async def tournamentStart(sid, tournamentCode):
    if (tournamentCode in ChannelList):
        channel = ChannelList[tournamentCode]
        if (channel.getCreator() == sid):
            tournament = channel.getTournament()
            tournament.setStart(True)
        else:
            await sio.emit('error', {'message': 'Vous n\'êtes pas le créateur du tournoi', 'ErrorCode': 1}, room=sid)
    else:
        await sio.emit('error', {'message': 'Tournoi non trouvé', 'ErrorCode': 1}, room=sid)
        
@sio.event
async def animationComplete(sid, data):
    gameCode = data.get('gameCode')
    game = findGame(gameCode, None)
    if game:
        await game.handleAnimationComplete(sio, data, sid)

def createTournamentPlayerList(tournament):
    info = []
    tournamentTeams = tournament.getTournamentTeamsList()
    for team in tournamentTeams.values():
        logger.info(f"team.getName(): {team.getName()}")
        info.append(team.getName())
    return info

def checkGameOptions(game, gameCode, sid, choices):
    data = createGameOptions(game, gameCode, sid)
    for team in data['teams']:
        if choices['teamID'] == team['value']:
            continue
    for teamRole in data['teamsRoles']:
        if choices['teamID'] == teamRole['teamId']:
            for role in teamRole['roles']:
                if role['value'] == choices['role']:
                    return True
            return False
    return False

def createGameOptions(game, gameCode, sid):
    if not game.gameStarted:
        teamsData = []
        teamsRolesData = {}

        for key, team in game.teams.items():
            if not team.getIsFull():
                teamsData.append({'name': team.name, 'value': key})

            rolesDataPossible = [
                {'name': 'Capitaine', 'value': 'captain'},
                {'name': 'Cannonier', 'value': 'Cannoneer'}
            ]

            takenRoles = [player.getRole() for player in team.player.values()]
            rolesDataAvailable = [role for role in rolesDataPossible 
                                if role['value'] not in takenRoles]

            teamsRolesData[key] = rolesDataAvailable

        data = {
            'teams': teamsData,
            'teamsRoles': [{'teamId': k, 'roles': v} 
                          for k, v in teamsRolesData.items()]
        }
        return data

async def updateGameOptions(game, gameCode, sid):
    data = createGameOptions(game, gameCode, sid)
    for team in game.teams.values():
        for player in team.player.values():
            if (player.getOnline() and player.getAllowedToReconnect() and not player.getIsInit()):
                pass
            else:
                await sio.emit('AvailableOptions', data, room=gameCode)

async def sendPlayerLists(game, gameCode, sid):
    logger.info("sendPlayerLists")
    teamsInfo = {}
    for key, team in game.teams.items():
        if team.player:
            teamsInfo[key] = [
                {'id': player.id, 'name': player.name, 'role': player.role}
                for player in team.player.values()
            ]
        else:
            teamsInfo[key] = []

    for team in game.teams.values():
        for player in team.player.values():
            if (player.getOnline() and player.getAllowedToReconnect() and not player.getIsInit()):
                await sio.emit('updatePlayerLists', teamsInfo, room=sid)
                player.setAllowedToReconnect(False)
                return
            else:
                await sio.emit('updatePlayerLists', teamsInfo, room=gameCode)
                return

async def ReadyToStart(gameCode, game):
    while not game.gameStarted or game.getIsPaused():
        if game.nbPlayerConnected == game.nbPlayerPerTeam * 2 and game.getPlayerReady() == game.nbPlayerPerTeam * 2:
            game.gameStarted = True
            game.setGameInLobby(False)
            game.setIsPaused(False)
            game.removeNbPlayerInLobby(game.nbPlayerPerTeam * 2)
            await sio.emit('gameUnpaused', room=gameCode)
            await sio.emit('gameStarted', room=gameCode)
            await asyncio.sleep(10)
            asyncio.create_task(startGame(gameCode, game))
            break
        await asyncio.sleep(0.1)

async def startTournament(sio, tournament, tournamentCode, start):
    if (start):
        tournament.createTournamentTree()
    if (len(tournament.getTournamentGamesList()) == 0):
        for i in range(tournament.getNbTeam() // 2):
            match = tournament.getNextMatch()
            logger.info(f"match {i} : {match}")
            if (match):
                team1 = match[0]
                team2 = match[1]
                await sio.emit('tournamentMatch', {'team1': team1.getName(), 'team2': team2.getName()}, room=tournamentCode)
                gameCode = tournamentCode + str(tournament.tournamentGameNumber)
                tournament.tournamentGameNumber += 1
                tournament.addTournamentGame(Game(gameCode, True, tournament))
                logger.info(f"Tournament Game {gameCode} created")
                tournamentGame[gameCode] = tournament.getTournamentGames(gameCode)
                game = tournamentGame[gameCode]
                game.setNbPlayerPerTeam(1)
                try:
                    await sio.enter_room(team1.getTournamentTeamId(), gameCode)
                    await sio.enter_room(team2.getTournamentTeamId(), gameCode)
                except KeyError:
                    logger.error(f"Impossible d'ajouter les joueurs à la room {gameCode}")
                    continue
                team1.setTeamId(1)
                team2.setTeamId(2)
                game.setTeam(team1)
                game.setTeam(team2)
                game.printGameDetails()
                logger.info(f"Starting Tournament Game {gameCode}")
                if team1.getTournamentTeamId() not in player_rooms:
                    player_rooms[team1.getTournamentTeamId()] = set()
                if team2.getTournamentTeamId() not in player_rooms:
                    player_rooms[team2.getTournamentTeamId()] = set()

                player_rooms[team1.getTournamentTeamId()].add(gameCode)
                player_rooms[team2.getTournamentTeamId()].add(gameCode)
                
        while (not tournament.getStart()):
            await asyncio.sleep(0.1)
        if (not start):
            await asyncio.sleep(10)
        for gameCode in tournament.getTournamentGamesList():
            if (gameCode in tournamentGame and gameCode in tournament.getTournamentGamesList()):
                game = tournamentGame[gameCode]
                if game and not game.gameStarted and game.getGameInLobby():
                    await sio.emit('startTournamentGame', {'gameCode': gameCode}, room=gameCode)
    
async def startGame(gameCode, game):
    if gameCode in active_games:
        logger.warning(f"Game {gameCode} already running")
        return
        
    active_games[gameCode] = True
    
    try:
        while game.gameStarted and game.getIsPaused() == False:
            if gameCode not in active_games:
                break
                
            ballPosition = await game.updateBallPosition()
            await game.handleCollisions(sio, gameCode)
            
            await sio.emit('gameState', {
                'ballPosition': game.getBallPosition(),
                'ballVelocity': game.ball_velocity
            }, room=gameCode)
            
            if game.getIsPaused():
                await ReadyToStart(gameCode, game)
            if game.gameStarted == False:
                break
                
            await asyncio.sleep(game.BALL_UPDATE_INTERVAL / 1000)
    
    finally:
        if gameCode in active_games:
            active_games.pop(gameCode)
        
        if game.getIsGameTournament() and not game.getIsPaused():
            await handle_tournament_end(game, gameCode)

async def handle_tournament_end(game, gameCode):
    logger.info(f"handle_tournament_end dans index.py {gameCode}")
    if not game.getWinner():
        return
        
    tournament = game.getTournament()
    winner = game.getWinner()
    loser = game.getLoser()
    
    tournament.updateTournamentTree(winner)
    
    winner.resetPosition()
    tournament.removeTournamentTeam(loser)
    
    originalGameCode = gameCode[:-1]
    await cleanup_tournament_game(tournament, game, gameCode, originalGameCode, loser)
    
    remaining_players = [team.getTournamentTeamId() for team in tournament.tournamentTeams.values() 
                        if team.getTournamentTeamId() in sio.manager.rooms['/']]
    
    if len(remaining_players) >= 2:
        await startTournament(sio, tournament, tournament.getTournamentId(), False)
    else:
        logger.warning("Pas assez de joueurs connectés pour continuer le tournoi")
        await sio.emit('tournamentWinner', winner.getName(), room=winner.getTournamentTeamId())
        await sio.emit('tournamentEnded', room=originalGameCode)

async def cleanup_tournament_game(tournament, game, gameCode, originalGameCode, loser):
    tournament.resetGameState(game)
    await sio.leave_room(loser.getTournamentTeamId(), originalGameCode)
    
    for team in game.teams.values():
        await sio.leave_room(team.getTournamentTeamId(), gameCode)
        if team.getTournamentTeamId() in player_rooms:
            if gameCode in player_rooms[team.getTournamentTeamId()]:
                player_rooms[team.getTournamentTeamId()].remove(gameCode)
    
    tournament.removeTournamentGame(game)
