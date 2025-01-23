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

# Configuration du logging au début du fichier
logging.basicConfig(
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Au début du fichier, après les imports
# host_ip = os.getenv("HOST_IP", "localhost")

# host_ip = 'localhost'

# Création du serveur Socket.IO
sio = socketio.AsyncServer(
    # cors_allowed_origins=[
    #     f'wss://{host_ip}:"env variable PROXYWAF_HTTPS_PORT"',
    #     f'https://{host_ip}:"env variable PROXYWAF_HTTPS_PORT"',
    #     'wss://localhost:"env variable PROXYWAF_HTTPS_PORT"',
    #     'https://localhost:"env variable PROXYWAF_HTTPS_PORT"',
    #     'wss://localhost:"env variable GAMESERVER_PORT"',
    #     'https://localhost:"env variable GAMESERVER_PORT"'
    # ],
    cors_allowed_origins='*',
    async_mode='asgi',
    # logger=True,
    # engineio_logger=True,
    # async_handlers=True,
    ping_timeout=60000,
    ping_interval=25000,
    transports=['websocket'],
    # allow_upgrades=True,
    # engineio_path='/socket.io'
)

# sio.instrument(auth={
#     'username': 'admin',
#     'password': 'admin',
# })

logger.info("**********Server started***********")

ChannelList = {}
active_games = {}
player_rooms = {}

def generateGameCode():
    return str(random.randint(1000, 9999))

@sio.event
async def disconnect(sid):
    logger.info(f'Client disconnected: {sid}')
    
    if sid in player_rooms:
        for room in player_rooms[sid]:
            logger.info(f'Cleaning up room {room} for player {sid}')
            await sio.leave_room(sid, room)
            if room in ChannelList:
                if (ChannelList[room].getIsTournament()):
                    tournament = ChannelList[room].getTournament()
                    originalGameCode = room[:-1]
                    game = tournament.getTournamentGames(originalGameCode)
                    logger.info(f'Tournament game cleanup for {originalGameCode}')
                else:
                    game = ChannelList[room].getGame()
                
                if game:
                    game.removeNbPlayerConnected()
                    game.removePlayerReady()
                    
                    for team in game.teams.values():
                        if team.getPlayerById(sid):
                            player = team.getPlayerById(sid)
                            player.setOnline(False)
                            player.setAllowedToReconnect(True)
                            team.setIsFull()
                            break
                    
                    if game.gameStarted and game.nbPlayerConnected > 0:
                        game.gameStarted = False
                        game.setIsPaused(True)
                        await sio.emit('gamePaused', room=room)
                    
                    if game.nbPlayerConnected == 0:
                        await cleanup_game(room, game)
                    logger.info(f'Regular game cleanup for {room}')
        
        del player_rooms[sid]

# Nouvelle fonction pour nettoyer une partie
async def cleanup_game(gameCode, game):
    logger.info(f"Cleaning up game {gameCode}")
    game.gameStarted = False
    
    for team in game.teams.values():
        for player in list(team.player.values()):
            if player.getId() in player_rooms:
                await sio.leave_room(player.getId(), gameCode)
            # Ne supprimer les joueurs que si ce n'est pas une partie de tournoi
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

@sio.event
async def connect(sid, environ):
    logger.info(f'Client connected: {sid}')
    # Initialiser le dictionnaire des rooms pour ce joueur
    player_rooms[sid] = set()

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
    await sio.emit('tournamentCreated', {'tournamentCode': tournamentCode, 'creator': sid}, room=sid)
    await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)

@sio.event
async def joinTournament(sid, data):
    logger.info(f"joinTournament {sid}, {data}")
    tournamentCode = data.get('tournamentCode')
    if tournamentCode in ChannelList:
        channel = ChannelList[tournamentCode]
        tournament = channel.getTournament()
        if tournament.getNbTeam() < 4:
            tournament.addTournamentTeam(Team(data.get('teamName'), 1, sid, None), sid)
            logger.info(f"tournament.getNbTeam() dans joinTournament dans index.py {tournament.getNbTeam()}")
            await sio.enter_room(sid, tournamentCode)
            await sio.emit('tournamentJoined', {'tournamentCode': tournamentCode, 'creator': channel.getCreator()}, room=sid)
            await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)
            if (tournament.getNbTeam() == 4):
                logger.info(f"Starting tournament {tournamentCode}")
                await startTournament(sio, tournament, tournamentCode, True)
        else:
            await sio.emit('error', {'message': 'Tournament is full'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Tournament not found'}, room=sid)

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
    logger.info(f"game.getNbPlayerPerTeam() dans createGame dans index.py {game.getNbPlayerPerTeam()}")
    logger.info(f"game.nbPlayerConnected() dans createGame dans index.py {game.nbPlayerConnected}")
    
    # Créer les équipes sans référence au tournoi puisque c'est une partie normale
    team1 = Team("Black-Beard", int(numPlayersPerTeam), None, 1)
    team2 = Team("White-Beard", int(numPlayersPerTeam), None, 2)
    
    # Définir le tournoi à None explicitement pour ces équipes
    team1.TournamentTeamId = None
    team2.TournamentTeamId = None
    
    game.setTeam(team1)
    game.setTeam(team2)
    
    await sio.enter_room(sid, gameCode)
    player_rooms[sid].add(gameCode)
    await sio.emit('gameCreated', {'gameCode': gameCode, 'creator': sid}, room=sid)
    await updateGameOptions(game, gameCode, sid)

@sio.event
async def confirmChoicesCreateGame(sid, choices):
    logger.info(f"confirmChoicesCreateGame {sid}, {choices}")
    gameCode = choices.get('gameCode')
    logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role for the game {gameCode}.")
    if (gameCode in ChannelList):
        channel = ChannelList[gameCode]
        game = channel.getGame()
        if (not game):
            await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
            return
        team = game.getTeam(int(choices['teamID']))
        if team:
            team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
            team.getPlayerById(sid).setOnline(True)
            await sendPlayerLists(game, gameCode, sid)
        else:
            logger.info("Équipe non trouvée")
            await sio.emit('error', {'message': 'Équipe non trouvée'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)

@sio.event
async def joinGame(sid, data):
    logger.info(f"joinGame {sid}, {data}")
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        logger.info(f"Player {sid} joined game {gameCode}")
        channel = ChannelList[gameCode]
        if (channel.getIsTournament()):
            await sio.emit('error', {'message': 'Ce n\'est pas un code de partie normale'}, room=sid)
            return
        game = channel.getGame()
        
        team1 = game.getTeam(1)
        team2 = game.getTeam(2)
        if (team1.getIsFull() and team2.getIsFull()) and game.getIsPaused() == False:
            await sio.emit('error', {'message': 'Partie pleine'}, room=sid)
            return
            
        await sio.enter_room(sid, gameCode)
        player_rooms[sid].add(gameCode)
        logger.info(f"game.getNbPlayerPerTeam() dans joinGame dans index.py {game.getNbPlayerPerTeam()}")
        await sio.emit('gameJoined', {'gameCode': gameCode, 'nbPlayerPerTeam': game.getNbPlayerPerTeam(), 'creator': channel.getCreator() }, room=sid)
        await updateGameOptions(game, gameCode, sid)


        # Vérification périodique si la partie est pleine
        async def check_game_full():
            gameIsFullMsgSend = False
            while True:
                if not gameIsFullMsgSend and team1.getIsFull() and team2.getIsFull():
                    await sio.emit('TeamsFull', room=gameCode)
                    gameIsFullMsgSend = True
                await asyncio.sleep(1)
        
        asyncio.create_task(check_game_full())
        
    else:
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)

@sio.event
async def confirmChoicesJoinGame(sid, choices):
    gameCode = choices.get('gameCode')
    logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role for the game {gameCode}.")
    if (gameCode in ChannelList):
        channel = ChannelList[gameCode]
        if (channel.getIsTournament()):
            await sio.emit('error', {'message': 'Ce n\'est pas un code de partie normale'}, room=sid)
            return
        game = channel.getGame()
        if (not game):
            await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
            return
        if (game.findTeamByPlayerName(choices['userName'])):
            team = game.findTeamByPlayerName(choices['userName'])
        else:
            if (not checkGameOptions(game, gameCode, sid, choices)):
                await sio.emit('error', {'message': 'Error : Invalid choices'}, room=sid)
                return
        team = game.getTeam(int(choices['teamID']))
        if team:
            if game.getPlayerByName(choices['userName']):
                player = game.getPlayerByName(choices['userName'])
                player.setOnline(True)
                player.setId(sid)
                logger.info(f"player.getOnline() dans join confirmChoices {player.getOnline()}")
                logger.info(f"game.getIsPaused() dans joinGame dans index.py {game.getIsPaused()}")
            else:
                team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
                team.getPlayerById(sid).setOnline(True)
            await sendPlayerLists(game, gameCode, sid)
            if (game.getIsPaused()):
                for team in game.teams.values():
                    for player in team.player.values():
                        if (player.getId() == sid):
                            player.setOnline(True)
                            await asyncio.sleep(5)
                            await sio.emit('startGame', room=sid)
                            logger.info(f"startGame sent to {sid}")
                            return
        else:
            logger.info("Équipe non trouvée")
            await sio.emit('error', {'message': 'Équipe non trouvée'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)

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
        if game.getTeam(1).getIsFull() and game.getTeam(2).getIsFull():
            if channel.getCreator() == sid:
                logger.info(f"Starting game {gameCode} in launchGame")
                # asyncio.create_task(startGame(gameCode, game))
                await sio.emit('startGame', room=gameCode)
            else:
                await sio.emit('error', {'message': 'Vous n\'êtes pas le créateur de la partie'}, room=sid)
        else:
            await sio.emit('error', {'message': 'Toutes les équipes ne sont pas pleines'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)

@sio.event
async def playerReady(sid, gameCode):
    logger.info(f"playerReady {gameCode}, {sid}")
    originalGameCode = None
    if (len(gameCode) == 5):
        originalGameCode = gameCode
        gameCode = gameCode[:-1]

    game = findGame(gameCode, originalGameCode)
    if (not game):
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
        return
    game.addPlayerReady()
    for team in game.teams.values():
        if (team.getPlayerById(sid)):
            team.getPlayerById(sid).setIsInit(True)
            logger.info(f"Player {sid} isInit = {team.getPlayerById(sid).getIsInit()}")
    logger.info(f"game.getPlayerReady() dans la fonction playerReady dans index.py {game.getPlayerReady()}")
    logger.info(f"game.getIsGameTournament() dans la fonction playerReady dans index.py {game.getIsGameTournament()}")
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
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
        return
    game.addNbPlayerConnected()
    if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
        if (game.getIsPaused()):
            await game.sendGameData(sio, gameCode, sid, originalGameCode, isTournament)
        else:
            await game.sendGameData(sio, gameCode, None, originalGameCode, isTournament)
    else:
        logger.info(f"Game {gameCode} / {originalGameCode} not started because not enough players connected, {game.nbPlayerConnected} / {game.nbPlayerPerTeam * 2}")
        for team in game.teams.values():
            logger.info(f"team.getName() dans GameStarted {team.getName()}")
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
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
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
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
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
        logger.info(f"sid : {sid}")
        logger.info(f"Probleme dans boatPosition dans index.py {gameCode} / {originalGameCode}")
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
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
    logger.info(f"ballFired in index.py {data['trajectory']}")

    game = findGame(gameCode, None)
    if (not game):
        await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)
        return
    await sio.emit('ballFired', data['trajectory'], room=gameCode, skip_sid=sid)
    if (await game.updateBallFired(data) == -1):
        await sio.emit('updateHealth', {
            'teamID': 1 if team == 2 else 1,
            'health': game.getTeam(1 if team == 2 else 1).getPV()
        }, room=gameCode)
        if (game.getTeam(1 if team == 2 else 1).removePV(10) == -1):
            await sio.emit('winner', game.getTeam(team).getName(), room=gameCode)
            game.gameStarted = False

@sio.event
async def tournamentStart(sid, tournamentCode):
    if (tournamentCode in ChannelList):
        channel = ChannelList[tournamentCode]
        if (channel.getCreator() == sid):
            tournament = channel.getTournament()
            tournament.setStart(True)
        else:
            await sio.emit('error', {'message': 'Vous n\'êtes pas le créateur du tournoi'}, room=sid)
    else:
        await sio.emit('error', {'message': 'Tournoi non trouvé'}, room=sid)

def createTournamentPlayerList(tournament):
    info = []
    tournamentTeams = tournament.getTournamentTeamsList()
    for team in tournamentTeams.values():
        info.append(team.getName())
    return info

def checkGameOptions(game, gameCode, sid, choices):
    data = createGameOptions(game, gameCode, sid)
    logger.info(f"data dans checkGameOptions dans index.py {data}")
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
                # await sio.emit('AvailableOptions', data, room=sid)
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
            else:
                await sio.emit('updatePlayerLists', teamsInfo, room=gameCode)

async def ReadyToStart(gameCode, game):
     # Attendre que tous les joueurs soient prêts
    while not game.gameStarted or game.getIsPaused():
        # logger.info(f"game.getPlayerReady() dans index.py {game.getPlayerReady()}")
        if game.nbPlayerConnected == game.nbPlayerPerTeam * 2 and game.getPlayerReady() == game.nbPlayerPerTeam * 2:
            game.gameStarted = True
            game.setIsPaused(False)
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
            logger.info(f"match dans startTournament dans index.py {match}")
            if (match):
                team1 = match[0]
                team2 = match[1]
                await sio.emit('tournamentMatch', {'team1': team1.getName(), 'team2': team2.getName()}, room=tournamentCode)
                gameCode = tournamentCode + str(i)
                tournament.addTournamentGame(Game(gameCode, True, tournament))
                game = tournament.getTournamentGames(gameCode)
                game.setNbPlayerPerTeam(1)
                try:
                    logger.info(f"team1.getTournamentTeamId() dans startTournament dans index.py {team1.getTournamentTeamId()}")
                    logger.info(f"team2.getTournamentTeamId() dans startTournament dans index.py {team2.getTournamentTeamId()}")
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
                logger.info(f"Game {gameCode} created")
                logger.info(f"Starting game {gameCode}")
                for team in game.teams.values():
                    logger.info(f"team.getTournamentTeamId() dans startTournament dans index.py {team.getTournamentTeamId()} / {team.getName()} / {gameCode} / {tournamentCode}")
                # await sio.emit('startTournamentGame', {'gameCode': gameCode}, room=gameCode)
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

# Nouvelle fonction pour gérer la fin d'un tournoi
async def handle_tournament_end(game, gameCode):
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
    
    # Vérifier s'il reste des joueurs pour continuer le tournoi
    remaining_players = [team.getTournamentTeamId() for team in tournament.tournamentTeams.values() 
                        if team.getTournamentTeamId() in sio.manager.rooms['/']]
    
    if len(remaining_players) >= 2:
        await startTournament(sio, tournament, tournament.getTournamentId(), False)
    else:
        logger.warning("Pas assez de joueurs connectés pour continuer le tournoi")
        await sio.emit('tournamentWinner', winner.getName(), room=winner.getTournamentTeamId())
        await sio.emit('tournamentEnded', room=originalGameCode)

# Nouvelle fonction pour nettoyer une partie de tournoi
async def cleanup_tournament_game(tournament, game, gameCode, originalGameCode, loser):
    # Faire quitter uniquement le perdant de la room du tournoi
    await sio.leave_room(loser.getTournamentTeamId(), originalGameCode)
    
    # Faire quitter tous les joueurs de la room de la partie
    for team in game.teams.values():
        await sio.leave_room(team.getTournamentTeamId(), gameCode)
        if team.getTournamentTeamId() in player_rooms:
            if gameCode in player_rooms[team.getTournamentTeamId()]:
                player_rooms[team.getTournamentTeamId()].remove(gameCode)
    
    # Supprimer la partie du tournoi
    tournament.removeTournamentGame(game)

async def broadcast_tournament_update(tournament, tournamentCode):
    matches = tournament.getTournamentMatches()
    await sio.emit('tournamentMatches', {
        'matches': matches,
        'tournamentTree': tournament.getTournamentTreeData()
    }, room=tournamentCode)

