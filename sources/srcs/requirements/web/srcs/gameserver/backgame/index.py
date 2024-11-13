import socketio
import asyncio
import os
import random
import math
from aiohttp import web
from Player import Player
from Team import Team
from Channel import Channel
import logging
import sys

# Configuration du logging au début du fichier
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Au début du fichier, après les imports
host_ip = os.getenv("HOST_IP", "localhost")

# Création du serveur Socket.IO
sio = socketio.AsyncServer(
    cors_allowed_origins=[
        f'http://{host_ip}:8888',
        f'http://{host_ip}:8001',
        f'http://{host_ip}:3000',
        'https://admin.socket.io',
        'http://localhost:8888',
        'http://localhost:8001',
        'http://localhost:3000'
    ],
    async_mode='aiohttp',
    # logger=True,
    # engineio_logger=True,
    # ping_timeout=60,
    # ping_interval=25,
    # max_http_buffer_size=1e8,
    # allow_upgrades=True,
    # http_compression=True,
    transports=['websocket', 'polling']
)

sio.instrument(auth={
    'username': 'admin',
    'password': 'admin',
})

# Création de l'application aiohttp
app = web.Application()
sio.attach(app)

logger.info("Server started")

# Routes HTTP
async def index(request):
    return web.Response(text="Hello", content_type='text/html')

async def health_check(request):
    return web.Response(text="OK", content_type='text/plain')

app.router.add_get('/', index)
app.router.add_get('/start', index)
app.router.add_get('/health', health_check)

# Constantes
BALL_SPEED = 0.1
BALL_UPDATE_INTERVAL = 50
FIELD_WIDTH = 60
FIELD_HEIGHT = 60

ChannelList = {}

def generateGameCode():
    return str(random.randint(1000, 9999))

def initializeBallPosition():
    return {"x": 0, "y": 0, "z": 0}

def initializeBallDirection():
    return {
        "x": random.random() * 2 - 1,
        "y": random.random() * 2 - 1,
        "z": 0
    }

async def updateBallPosition(ballPosition, ballDirection):
    ballPosition["x"] += ballDirection["x"] * BALL_SPEED
    ballPosition["y"] += ballDirection["y"] * BALL_SPEED
    return ballPosition

async def detectCollisionWithBoats(ballPosition, teams):
    for key, team in teams.items():
        if team.getBoatHitbox() and await isColliding(ballPosition, team.getBoatHitbox()):
            print(f"Collision avec le bateau de l'équipe {key}")
            return True
    return False

async def isColliding(ballPosition, boatHitbox):
    ballRadius = 0.5
    x = max(boatHitbox["min"]["x"], min(ballPosition["x"], boatHitbox["max"]["x"]))
    y = max(boatHitbox["min"]["y"], min(ballPosition["y"], boatHitbox["max"]["y"]))
    z = max(boatHitbox["min"]["z"], min(ballPosition["z"], boatHitbox["max"]["z"]))

    distance = math.sqrt(
        (x - ballPosition["x"]) ** 2 +
        (y - ballPosition["y"]) ** 2 +
        (z - ballPosition["z"]) ** 2
    )
    return distance < ballRadius

async def handleWallCollisions(ballPosition, ballDirection, teams, gameCode):
    if ballPosition["x"] <= -FIELD_WIDTH / 2 or ballPosition["x"] >= FIELD_WIDTH / 2:
        ballDirection["x"] = -ballDirection["x"]
        logger.info("Collision with wall")

    if ballPosition["y"] <= -FIELD_HEIGHT / 2:
        teams[2].addPoint()
        resetBall(ballPosition, ballDirection)
        await sio.emit('scoreUpdate', {
            'team1': teams[1].getScore(),
            'team2': teams[2].getScore()
        }, room=gameCode)
    elif ballPosition["y"] >= FIELD_HEIGHT / 2:
        teams[1].addPoint()
        resetBall(ballPosition, ballDirection)
        await sio.emit('scoreUpdate', {
            'team1': teams[1].getScore(),
            'team2': teams[2].getScore()
        }, room=gameCode)

    return ballDirection

def resetBall(ballPosition, ballDirection):
    ballPosition["x"] = 0
    ballPosition["y"] = 0
    ballDirection["x"] = random.random() * 2 - 1
    ballDirection["y"] = random.random() * 2 - 1

async def handleCollisions(ballPosition, ballDirection, game, gameCode):
    ballDirection = await handleWallCollisions(ballPosition, ballDirection, game.teams, gameCode)
    if await detectCollisionWithBoats(ballPosition, game.teams):
        print("Collision détectée, inversion de la direction")
        ballDirection["x"] = -ballDirection["x"]
        ballDirection["y"] = -ballDirection["y"]
    return ballDirection

@sio.event
async def disconnect(sid):
    logger.info(f'Client disconnected: {sid}')
    # await sio.leave_room(sid)

@sio.event
async def connect(sid, environ):
    logger.info(f'Client connected: {sid}')

    @sio.event
    async def createGame(sid, data):
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
            channel = ChannelList[gameCode]
            game = channel.getGame()
            
            team1 = game.getTeam(1)
            team2 = game.getTeam(2)
            if team1.getIsFull() and team2.getIsFull():
                await sio.emit('error', {'message': 'Partie pleine'}, room=sid)
                return
                
            await sio.enter_room(sid, gameCode)
            await sio.emit('gameJoined', {'gameCode': gameCode}, room=sid)
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

    @sio.event
    async def ClientData(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            game.updateClientData(data)
            game.gameStarted = True

    @sio.event
    async def cannonPosition(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            game.updateCannonPosition(data['team'], data['cannonPosition']['x'], 
                                    data['cannonPosition']['y'], data['cannonPosition']['z'])
            await sio.emit('cannonPosition', {
                'teamID': data['team'],
                'cannonPosition': data['cannonPosition']
            }, room=gameCode, skip_sid=sid)

    @sio.event
    async def boatPosition(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            game.updateBoatPosition(data['team'], data['boatPosition']['x'], 
                                data['boatPosition']['y'], data['boatPosition']['z'])
            await sio.emit('boatPosition', {
                'teamID': data['team'],
                'boatPosition': data['boatPosition']
            }, room=gameCode, skip_sid=sid)

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
    ballPosition = initializeBallPosition()
    ballDirection = initializeBallDirection()

    while True:
        # ballPosition = await updateBallPosition(ballPosition, ballDirection)
        # ballDirection = await handleCollisions(ballPosition, ballDirection, game, gameCode)
        # await sio.emit('gameState', {'ballPosition': ballPosition}, room=gameCode)
        await asyncio.sleep(BALL_UPDATE_INTERVAL / 1000)

if __name__ == '__main__':
    # Attendre un peu que l'adresse IP soit disponible
    import time
    time.sleep(2)  # Attendre 2 secondes

    try:
        web.run_app(app, 
                    host="0.0.0.0",  # Écouter sur toutes les interfaces d'abord
                    port=3000)
    except OSError as e:
        print(f"Première tentative échouée: {e}")
        # Deuxième tentative avec l'IP spécifique
        try:
            web.run_app(app, 
                        host=host_ip,
                        port=3000)
        except OSError as e:
            print(f"Deuxième tentative échouée: {e}")
            # Dernière tentative sur localhost
            web.run_app(app, 
                        host="localhost",
                        port=3000)
