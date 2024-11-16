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
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    # stream=sys.stdout
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
# BALL_SPEED = 0.2
# SPEED_INCREASE_FACTOR = 1.1  # Facteur d'augmentation de la vitesse
# BALL_UPDATE_INTERVAL = 50
# FIELD_WIDTH = 60
# FIELD_HEIGHT = 60

ChannelList = {}

def generateGameCode():
    return str(random.randint(1000, 9999))

# def initializeBallPosition():
#     return {"x": 0, "y": 0, "z": 0}

# def initializeBallDirection():
#     return {
#         "x": random.random() * 2 - 1,
#         "y": random.random() * 2 - 1,
#         "z": 0
#     }

# async def updateBallPosition(ballPosition, ballDirection):
#     ballPosition["x"] += ballDirection["x"] * BALL_SPEED
#     ballPosition["y"] += ballDirection["y"] * BALL_SPEED
#     return ballPosition

# async def isColliding(ballPosition, team):
#     ballRadius = 0.5
#     hitbox = team.getBoatHitbox()
#     boatPos = team.getBoat()
    
#     if not hitbox or not boatPos:
#         logger.debug("Hitbox ou position du bateau non disponible")
#         return False
        
#     # Vérifier que la hitbox n'est pas juste des zéros
#     if (hitbox['min']['x'] == 0 and hitbox['min']['y'] == 0 and 
#         hitbox['max']['x'] == 0 and hitbox['max']['y'] == 0):
#         logger.debug(f"Hitbox invalide pour l'équipe {team.getTeamId()}")
#         return False
        
#     # Vérifier si la balle est dans la hitbox
#     isInXRange = hitbox['min']['x'] - ballRadius <= ballPosition['x'] <= hitbox['max']['x'] + ballRadius
#     isInYRange = hitbox['min']['y'] - ballRadius <= ballPosition['y'] <= hitbox['max']['y'] + ballRadius
#     isInZRange = hitbox['min']['z'] - ballRadius <= ballPosition['z'] <= hitbox['max']['z'] + ballRadius
    
#     if isInXRange and isInYRange and isInZRange:
#         logger.info(f"Collision détectée - Ball: {ballPosition}, Boat: {boatPos}, Hitbox: {hitbox}")
#         return True
        
#     return False

# async def detectCollisionWithBoats(ballPosition, teams):
#     for key, team in teams.items():
#         boat_pos = team.getBoat()
#         if boat_pos['x'] == 0 and boat_pos['y'] == 0 and boat_pos['z'] == 0:
#             logger.debug(f"Position du bateau non initialisée pour l'équipe {key}")
#             continue
            
#         if await isColliding(ballPosition, team):
#             logger.info(f"Collision avec le bateau de l'équipe {key}")
#             return True
#     return False

# async def handleCollisions(ballPosition, ballDirection, game, gameCode):
#     global BALL_SPEED  # Ajoutez cette ligne pour modifier la variable globale
    
#     # Collision avec les murs latéraux
#     if ballPosition["x"] <= -FIELD_WIDTH / 2 or ballPosition["x"] >= FIELD_WIDTH / 2:
#         ballDirection["x"] = -ballDirection["x"]
#         logger.info("Collision avec un mur latéral")
#         BALL_SPEED *= SPEED_INCREASE_FACTOR  # Augmentation de la vitesse
#         logger.info(f"Nouvelle vitesse de la balle: {BALL_SPEED}")

#     # Collision avec les bateaux
#     if await detectCollisionWithBoats(ballPosition, game.teams):
#         logger.info("Collision avec un bateau")
#         ballDirection["y"] = -ballDirection["y"]  # Inverser la direction verticale
        
#     # Points marqués (collision avec les murs du haut/bas)
#     if ballPosition["y"] <= -FIELD_HEIGHT / 2:
#         # Point pour l'équipe 1
#         game.teams[1].addPoint()
#         logger.info(f"Point marqué par l'équipe 1 - Score: {game.teams[1].getScore()}")
#         ballPosition = initializeBallPosition()
#         ballDirection = initializeBallDirection()
#         await sio.emit('scoreUpdate', {
#             'team1': game.teams[1].getScore(),
#             'team2': game.teams[2].getScore()
#         }, room=gameCode)
#         BALL_SPEED = 0.5  # Réinitialiser la vitesse
#     elif ballPosition["y"] >= FIELD_HEIGHT / 2:
#         # Point pour l'équipe 2
#         game.teams[2].addPoint()
#         logger.info(f"Point marqué par l'équipe 2 - Score: {game.teams[2].getScore()}")
#         ballPosition = initializeBallPosition()
#         ballDirection = initializeBallDirection()
#         await sio.emit('scoreUpdate', {
#             'team1': game.teams[1].getScore(),
#             'team2': game.teams[2].getScore()
#         }, room=gameCode)
#         BALL_SPEED = 0.5  # Réinitialiser la vitesse

#     return ballDirection

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
            game = ChannelList[gameCode].getGame()
            game.updateClientData(data)
            game.gameStarted = True

    @sio.event
    async def cannonPosition(sid, data):
        gameCode = data.get('gameCode')
        if gameCode in ChannelList:
            game = ChannelList[gameCode].getGame()
            await game.updateCannonPosition(data['team'], data['cannonPosition']['x'], 
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
            await game.updateBoatPosition(data['team'], data['boatPosition']['x'], 
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
    # ballPosition = initializeBallPosition()
    # ballDirection = initializeBallDirection()
    logger.info(f"En attente que tous les joueurs soient prêts pour la partie {gameCode}")
    
    # Attendre que tous les joueurs soient prêts
    while not game.gameStarted:
        if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
            game.gameStarted = True
        await asyncio.sleep(0.1)
    
    logger.info(f"Démarrage de la partie {gameCode} avec {game.nbPlayerConnected} joueurs")
    
    while game.gameStarted:
        await game.updateBallPosition()
        await game.handleCollisions(sio, gameCode)
        await sio.emit('gameState', {'ballPosition': game.getBallPosition()}, room=gameCode)
        await asyncio.sleep(game.BALL_UPDATE_INTERVAL / 1000)
    
    logger.info(f"Partie {gameCode} terminée")

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
