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
    
    # Nettoyer toutes les rooms du joueur
    if sid in player_rooms:
        for room in player_rooms[sid]:
            await sio.leave_room(sid, room)
            if room in ChannelList:
                if (ChannelList[room].getIsTournament()):
                    tournament = ChannelList[room].getTournament()
                    originalGameCode = room[:-1]
                    game = tournament.getTournamentGames(originalGameCode)
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
        
        del player_rooms[sid]

# Nouvelle fonction pour nettoyer une partie
async def cleanup_game(gameCode, game):
    logger.info(f"Cleaning up game {gameCode}")
    game.gameStarted = False
    
    for team in game.teams.values():
        for player in list(team.player.values()):
            if player.getId() in player_rooms:
                await sio.leave_room(player.getId(), gameCode)
            team.removePlayer(player.getId())
    
    await sio.close_room(gameCode)
    if gameCode in ChannelList:
        ChannelList.pop(gameCode)
    if gameCode in active_games:
        active_games.pop(gameCode)

@sio.event
async def connect(sid, environ):
    logger.info(f'Client connected: {sid}')

# TODO: Verifier que les events Listeners sont pas dupliqués a cause de la connexion multiple

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
        await sio.emit('tournamentCreated', {'tournamentCode': tournamentCode}, room=sid)
        await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)


    @sio.event
    async def joinTournament(sid, data):
        logger.info(f"joinTournament {sid}, {data}")
        tournamentCode = data.get('tournamentCode')
        if tournamentCode in ChannelList:
            channel = ChannelList[tournamentCode]
            tournament = channel.getTournament()
            if tournament.getNbTeam() < 8:
                tournament.addTournamentTeam(Team(data.get('teamName'), 1, sid, None), sid)
                logger.info(f"tournament.getNbTeam() dans joinTournament dans index.py {tournament.getNbTeam()}")
                await sio.enter_room(sid, tournamentCode)
                await sio.emit('tournamentJoined', {'tournamentCode': tournamentCode}, room=sid)
                await sio.emit('tournamentPlayerList', createTournamentPlayerList(tournament), room=tournamentCode)
                if (tournament.getNbTeam() == 8):
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
        logger.info(f"game.getNbPlayerPerTeam() dans createGame dans index.py {game.getNbPlayerPerTeam()}")
        logger.info(f"game.nbPlayerConnected() dans createGame dans index.py {game.nbPlayerConnected}")
        
        game.setTeam(Team("Black-Beard", int(numPlayersPerTeam), None, 1))
        game.setTeam(Team("White-Beard", int(numPlayersPerTeam), None, 2))
        
        await sio.enter_room(sid, gameCode)
        await sio.emit('gameCreated', {'gameCode': gameCode}, room=sid)
        await updateGameOptions(game, gameCode, sid)

        # Définir un gestionnaire d'événements imbriqué
        @sio.event
        async def confirmChoices(sid, choices):
            logger.info(f"confirmChoices {sid}, {choices}")
            logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role.")
            team = game.getTeam(int(choices['teamID']))
            if team:
                team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
                team.getPlayerById(sid).setOnline(True)
                await sendPlayerLists(game, gameCode, sid)
            else:
                logger.info("Équipe non trouvée")
                await sio.emit('error', {'message': 'Équipe non trouvée'}, room=sid)

    @sio.event
    async def joinGame(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            logger.info(f"Player {sid} joined game {gameCode}")
            channel = ChannelList[gameCode]
            game = channel.getGame()
            
            team1 = game.getTeam(1)
            team2 = game.getTeam(2)
            if (team1.getIsFull() and team2.getIsFull()) and game.getIsPaused() == False:
                await sio.emit('error', {'message': 'Partie pleine'}, room=sid)
                return
                
            await sio.enter_room(sid, gameCode)
            logger.info(f"game.getNbPlayerPerTeam() dans joinGame dans index.py {game.getNbPlayerPerTeam()}")
            await sio.emit('gameJoined', {'gameCode': gameCode, 'nbPlayerPerTeam': game.getNbPlayerPerTeam(), 'creator': channel.getCreator() }, room=sid)
            await updateGameOptions(game, gameCode, sid)

            # Définir un gestionnaire d'événements imbriqué pour confirmChoices
            @sio.event
            async def confirmChoices(sid, choices):
                logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role.")
                
                if (game.findTeamByPlayerName(choices['userName'])):
                    team = game.findTeamByPlayerName(choices['userName'])
                else:
                    if (not checkGameOptions(game, gameCode, sid, choices)):
                        await sio.emit('error', {'message': 'Error : Invalid choices'}, room=sid)
                        return
                    team = game.getTeam(int(choices['teamID']))
                if team:
                    if team.getPlayerByName(choices['userName']):
                        player = team.getPlayerByName(choices['userName'])
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
    
    @sio.event
    async def playerReady(sid, gameCode):
        logger.info(f"playerReady {gameCode}, {sid}")

        if (len(gameCode) == 5):
            originalGameCode = gameCode
            gameCode = gameCode[:-1]

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(originalGameCode)
            else:
                game = ChannelList[gameCode].getGame()
            if (not game):
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
        else:
            await sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)


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

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(originalGameCode)
            else:
                game = ChannelList[gameCode].getGame()
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
                for team in game.teams.values():
                    logger.info(f"team.getName() dans GameStarted {team.getName()}")
                game.gameStarted = False

    @sio.event
    async def ClientData(sid, data):
        gameCode = data.get('gameCode')
        logger.info(f"ClientData {gameCode}")
        if (len(gameCode) == 5):
            originalGameCode = gameCode
            gameCode = gameCode[:-1]

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(originalGameCode)
            else:
                game = ChannelList[gameCode].getGame()
            if (not game):
                return
            await game.updateClientData(data)

    @sio.event
    async def cannonPosition(sid, data):
        gameCode = data.get('gameCode')
        if (len(gameCode) == 5):
            originalGameCode = gameCode
            gameCode = gameCode[:-1]

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(originalGameCode)
            else:
                game = ChannelList[gameCode].getGame()
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
        if (len(gameCode) == 5):
            originalGameCode = gameCode
            gameCode = gameCode[:-1]

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(originalGameCode)
            else:
                game = ChannelList[gameCode].getGame()
            if (not game):
                return
            await game.updateBoatPosition(data['team'], data['boatPosition']['x'])
            if (game.getIsGameTournament()):
                logger.info(f"isTournament dans boatPosition dans index.py")
                await sio.emit('boatPosition', {
                    'teamID': data['team'],
                    'boatPosition': data['boatPosition'],
                    'sid': sid
                }, room=originalGameCode, skip_sid=sid)
            else:
                logger.info(f"isNotTournament dans boatPosition dans index.py")
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

        if gameCode in ChannelList:
            if (ChannelList[gameCode].getIsTournament()):
                tournament = ChannelList[gameCode].getTournament()
                game = tournament.getTournamentGames(gameCode)
            else:
                game = ChannelList[gameCode].getGame()
            if (not game):
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
    logger.info(f"game.gameStarted dans ReadyToStart dans index.py {game.gameStarted}")
    logger.info(f"game.getIsPaused() dans ReadyToStart dans index.py {game.getIsPaused()}")
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
        await sio.emit('tournamentFull', {'tournamentTree': tournament.getTournamentTreeData()}, room=tournamentCode)
    while (not tournament.getStart()):
        await asyncio.sleep(0.1)
    logger.info(f"tournament.getNbTeam() dans startTournament dans index.py {tournament.getNbTeam()}")
    logger.info(f"len(tournament.getTournamentGamesList()) dans startTournament dans index.py {len(tournament.getTournamentGamesList())}")
    if (len(tournament.getTournamentGamesList()) == 0):
        if (not start):
            await asyncio.sleep(10)
        for i in range(tournament.getNbTeam() // 2):
            logger.info(f"i dans startTournament dans index.py {i}")
            match = tournament.getNextMatch()
            logger.info(f"match dans startTournament dans index.py {match}")
            if (match):
                team1 = match[0]
                team2 = match[1]
                await sio.emit('tournamentMatch', {'team1': team1.getName(), 'team2': team2.getName()}, room=tournamentCode)
                logger.info(f"team1.getTournamentTeamId() dans startTournament dans index.py {team1.getTournamentTeamId()}")
                logger.info(f"team2.getTournamentTeamId() dans startTournament dans index.py {team2.getTournamentTeamId()}")
                gameCode = tournamentCode + str(i)
                tournament.addTournamentGame(Game(gameCode, True, tournament))
                game = tournament.getTournamentGames(gameCode)
                game.setNbPlayerPerTeam(1)
                await sio.enter_room(team1.getTournamentTeamId(), gameCode)
                await sio.enter_room(team2.getTournamentTeamId(), gameCode)
                team1.setTeamId(1)
                team2.setTeamId(2)
                game.setTeam(team1)
                game.setTeam(team2)
                game.printGameDetails()
                logger.info(f"Game {gameCode} created")
                logger.info(f"Starting game {gameCode}")
                for team in game.teams.values():
                    logger.info(f"team.getTournamentTeamId() dans startTournament dans index.py {team.getTournamentTeamId()} / {team.getName()} / {gameCode} / {tournamentCode}")
                # if (start):
                await sio.emit('startTournamentGame', {'gameCode': gameCode}, room=gameCode)
                # else:
                #     await sio.emit('GameCode', {'gameCode': gameCode}, room=gameCode)
    

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
    await sio.emit('tournamentWinner', winner.getName(), room=winner.getTournamentTeamId())
    
    winner.resetPosition()
    tournament.removeTournamentTeam(loser)
    
    originalGameCode = gameCode[:-1]
    await cleanup_tournament_game(tournament, game, gameCode, originalGameCode, loser)
    
    await startTournament(sio, tournament, tournament.getTournamentId(), False)

# Nouvelle fonction pour nettoyer une partie de tournoi
async def cleanup_tournament_game(tournament, game, gameCode, originalGameCode, loser):
    await sio.leave_room(loser.getTournamentTeamId(), originalGameCode)
    
    for team in game.teams.values():
        await sio.leave_room(team.getTournamentTeamId(), gameCode)
        if team.getTournamentTeamId() in player_rooms:
            player_rooms[team.getTournamentTeamId()].remove(gameCode)
    
    tournament.resetGameState(game)
    tournament.removeTournamentGame(game)
