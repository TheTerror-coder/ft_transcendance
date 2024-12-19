import socketio
import asyncio
import os
import random
import math
from .Player import Player
from .Team import Team
from .Channel import Channel
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
    #     f'wss://{host_ip}:1443',
    #     f'https://{host_ip}:1443',
    #     'wss://localhost:1443',
    #     'https://localhost:1443',
    #     'wss://localhost:8001',
    #     'https://localhost:8001'
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

def generateGameCode():
    return str(random.randint(1000, 9999))

@sio.event
async def disconnect(sid):
    logger.info(f'Client disconnected: {sid}')
    for gameCode, channel in ChannelList.items():
        game = channel.getGame()
        game.removeNbPlayerConnected()
        for team in game.teams.values():
            if team.getPlayerById(sid):
                team.removePlayer(sid)
        if game.nbPlayerConnected == 0:
            logger.info(f"Closing room {gameCode} because no player is connected")
            game.gameStarted = False
            await sio.close_room(gameCode, sid)
    # await sio.leave_room(sid)

@sio.event
async def connect(sid, environ):
    logger.info(f'Client connected: {sid}')

    @sio.event
    async def createGame(sid, data):
        logger.info(f"createGame {sid}, {data}")
        numPlayersPerTeam = data.get('numPlayersPerTeam')
        gameCode = generateGameCode()
        while gameCode in ChannelList:
            gameCode = generateGameCode()

        channel = Channel(gameCode, sid)
        ChannelList[gameCode] = channel
        game = channel.getGame()
        game.setNbPlayerPerTeam(int(numPlayersPerTeam))
        
        game.setTeam(Team("L'equipage du chapeau de paille", int(numPlayersPerTeam), 1))
        game.setTeam(Team("L'equipage de Barbe-Noire", int(numPlayersPerTeam), 2))
        
        await sio.enter_room(sid, gameCode)
        await sio.emit('gameCreated', {'gameCode': gameCode}, room=sid)
        await updateGameOptions(game, gameCode)

        # Définir un gestionnaire d'événements imbriqué
        @sio.event
        async def confirmChoices(sid, choices):
            logger.info(f"confirmChoices {sid}, {choices}")
            logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role.")
            team = game.getTeam(int(choices['teamID']))
            if team:
                team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
                await sendPlayerLists(game, gameCode)
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
            if team1.getIsFull() and team2.getIsFull():
                await sio.emit('error', {'message': 'Partie pleine'}, room=sid)
                return
                
            await sio.enter_room(sid, gameCode)
            logger.info(f"game.getNbPlayerPerTeam() dans joinGame dans index.py {game.getNbPlayerPerTeam()}")
            await sio.emit('gameJoined', {'gameCode': gameCode, 'nbPlayerPerTeam': game.getNbPlayerPerTeam() }, room=sid)
            await updateGameOptions(game, gameCode)

            # Définir un gestionnaire d'événements imbriqué pour confirmChoices
            @sio.event
            async def confirmChoices(sid, choices):
                logger.info(f"Player {sid}, {choices['userName']} has chosen {choices['teamID']} as their team and {choices['role']} as their role.")
                team = game.getTeam(int(choices['teamID']))
                if team:
                    team.setPlayer(Player(sid, choices['role'], choices['userName'], int(choices['teamID'])))
                    await sendPlayerLists(game, gameCode)
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
            channel = ChannelList[gameCode]
            game = channel.getGame()
            if game.getTeam(1).getIsFull() and game.getTeam(2).getIsFull():
                if channel.getCreator() == sid:
                    logger.info(f"Starting game {gameCode} in launchGame")
                    asyncio.create_task(startGame(gameCode, game))
                    await sio.emit('startGame', room=gameCode)
                else:
                    await sio.emit('error', {'message': 'Vous n\'êtes pas le créateur de la partie'}, room=sid)
            else:
                await sio.emit('error', {'message': 'Toutes les équipes ne sont pas pleines'}, room=sid)

    @sio.event
    async def GameStarted(sid, gameCode):
        logger.info(f"GameStarted {gameCode}")
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            game.addNbPlayerConnected()
            if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
                await game.sendGameData(sio, gameCode)
            else:
                logger.info(f"Game {gameCode} not started because not enough players connected, {game.nbPlayerConnected} / {game.nbPlayerPerTeam * 2}")
                game.gameStarted = False

    @sio.event
    async def ClientData(sid, data):
        gameCode = data.get('gameCode')
        logger.info(f"ClientData {gameCode}")
        if gameCode in ChannelList:
            logger.info(f"ClientData {gameCode} in ChannelList")
            game = ChannelList[gameCode].getGame()
            await game.updateClientData(data)
            if (game.nbPlayerConnected == game.nbPlayerPerTeam * 2):
                game.gameStarted = True
                await sio.emit('gameStarted', room=gameCode)

    @sio.event
    async def cannonPosition(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            await game.updateCannonPosition(data['team'], data['cannonPosition']['x'])
            await sio.emit('cannonPosition', {
                'teamID': data['team'],
                'cannonPosition': data['cannonPosition']
            }, room=gameCode, skip_sid=sid)

    @sio.event
    async def boatPosition(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            await game.updateBoatPosition(data['team'], data['boatPosition']['x'])
            await sio.emit('boatPosition', {
                'teamID': data['team'],
                'boatPosition': data['boatPosition']
            }, room=gameCode, skip_sid=sid)

    @sio.event
    async def BallFired(sid, data):
        gameCode = data.get('gameCode')
        team = data.get('team')
        logger.info(f"ballFired in index.py {data['trajectory']}")
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            await sio.emit('ballFired', data['trajectory'], room=gameCode)
            if (await game.updateBallFired(data) == -1):
                await sio.emit('updateHealth', {
                    'teamID': team,
                    'health': game.getTeam(team).getPV()
                }, room=gameCode)
                if (game.getTeam(team).removePV(10) == -1):
                    await sio.emit('winner', game.getTeam(team).getName(), room=gameCode)
                    game.gameStarted = False

async def updateGameOptions(game, gameCode):
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
        await sio.emit('AvailableOptions', data, room=gameCode)

async def sendPlayerLists(game, gameCode):
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
    await sio.emit('updatePlayerLists', teamsInfo, room=gameCode)

async def startGame(gameCode, game):
    logger.info(f"En attente que tous les joueurs soient prêts pour la partie {gameCode}")
    
    # Attendre que tous les joueurs soient prêts
    while not game.gameStarted:
        if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
            game.gameStarted = True
        j = 0
        for i in game.teams.values():
            logger.info(f"team {i.TeamId} isFull: {i.getIsFull()}")
            j += 1
        logger.info(f"j: {j}")
        await asyncio.sleep(0.1)
    
    logger.info(f"Démarrage de la partie {gameCode} avec {game.nbPlayerConnected} joueurs")
    
    while game.gameStarted:
        await game.updateBallPosition()
        await game.handleCollisions(sio, gameCode)
        await sio.emit('gameState', {'ballPosition': game.getBallPosition()}, room=gameCode)
        await asyncio.sleep(game.BALL_UPDATE_INTERVAL / 1000)
    
    logger.info(f"Partie {gameCode} terminée")
