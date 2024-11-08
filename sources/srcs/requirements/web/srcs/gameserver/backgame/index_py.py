import socketio
import eventlet
import os
import random
import math
from Player import Player
from Team import Team
from Channel import Channel

# Création du serveur Socket.IO
sio = socketio.Server(
    cors_allowed_origins=[
        f'http://{os.getenv("HOST_IP", "localhost")}:8888',
        f'http://{os.getenv("HOST_IP", "localhost")}:3000',
        'https://admin.socket.io',
        'http://localhost:3000'
    ],
    async_mode='eventlet'
)

app = socketio.WSGIApp(sio)

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
        print("Collision with wall")

    if ballPosition["y"] <= -FIELD_HEIGHT / 2:
        teams[2].addPoint()
        resetBall(ballPosition, ballDirection)
        sio.emit('scoreUpdate', {
            'team1': teams[1].getScore(),
            'team2': teams[2].getScore()
        }, room=gameCode)
    elif ballPosition["y"] >= FIELD_HEIGHT / 2:
        teams[1].addPoint()
        resetBall(ballPosition, ballDirection)
        sio.emit('scoreUpdate', {
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
def connect(sid, environ):
    print('Client connected:', sid)

@sio.event
def disconnect(sid):
    print('Client disconnected:', sid)

@sio.event
def createGame(sid, data):
    numPlayersPerTeam = data.get('numPlayersPerTeam')
    gameCode = generateGameCode()
    while gameCode in ChannelList:
        gameCode = generateGameCode()

    channel = Channel(gameCode, sid)
    ChannelList[gameCode] = channel
    game = channel.getGame()
    game.setNbPlayerPerTeam(numPlayersPerTeam)
    
    game.setTeam(Team("L'equipage du chapeau de paille", numPlayersPerTeam, 1))
    game.setTeam(Team("L'equipage de Barbe-Noire", numPlayersPerTeam, 2))
    
    sio.enter_room(sid, gameCode)
    sio.emit('gameCreated', {'gameCode': gameCode}, room=sid)
    updateGameOptions(game, gameCode)

@sio.event
def joinGame(sid, data):
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        channel = ChannelList[gameCode]
        game = channel.getGame()
        
        if game.getTeam(1).getIsFull() and game.getTeam(2).getIsFull():
            sio.emit('error', {'message': 'Partie pleine'}, room=sid)
            return
            
        sio.enter_room(sid, gameCode)
        sio.emit('gameJoined', {'gameCode': gameCode}, room=sid)
        updateGameOptions(game, gameCode)
    else:
        sio.emit('error', {'message': 'Partie non trouvée'}, room=sid)

@sio.event
def confirmChoices(sid, data):
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        game = ChannelList[gameCode].getGame()
        team = game.getTeam(int(data['teamID']))
        if team:
            team.setPlayer(Player(sid, data['role'], data['userName'], int(data['teamID'])))
            sendPlayerLists(game, gameCode)
        else:
            sio.emit('error', {'message': 'Équipe non trouvée'}, room=sid)

@sio.event
def launchGame(sid, gameCode):
    if gameCode in ChannelList:
        channel = ChannelList[gameCode]
        game = channel.getGame()
        if game.getTeam(1).getIsFull() and game.getTeam(2).getIsFull():
            if channel.getCreator() == sid:
                eventlet.spawn(startGame, gameCode, game)
                sio.emit('startGame', room=gameCode)
            else:
                sio.emit('error', {'message': 'Vous n\'êtes pas le créateur de la partie'}, room=sid)
        else:
            sio.emit('error', {'message': 'Toutes les équipes ne sont pas pleines'}, room=sid)

@sio.event
def GameStarted(sid, gameCode):
    if gameCode in ChannelList:
        game = ChannelList[gameCode].getGame()
        game.addNbPlayerConnected()
        if game.nbPlayerConnected == game.nbPlayerPerTeam * 2:
            game.sendGameData(sio, gameCode)

@sio.event
def ClientData(sid, data):
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        game = ChannelList[gameCode].getGame()
        game.updateClientData(data)
        game.gameStarted = True

@sio.event
def cannonPosition(sid, data):
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        game = ChannelList[gameCode].getGame()
        game.updateCannonPosition(data['team'], data['cannonPosition']['x'], 
                                data['cannonPosition']['y'], data['cannonPosition']['z'])
        sio.emit('cannonPosition', {
            'teamID': data['team'],
            'cannonPosition': data['cannonPosition']
        }, room=gameCode, skip_sid=sid)

@sio.event
def boatPosition(sid, data):
    gameCode = data.get('gameCode')
    if gameCode in ChannelList:
        game = ChannelList[gameCode].getGame()
        game.updateBoatPosition(data['team'], data['boatPosition']['x'], 
                              data['boatPosition']['y'], data['boatPosition']['z'])
        sio.emit('boatPosition', {
            'teamID': data['team'],
            'boatPosition': data['boatPosition']
        }, room=gameCode, skip_sid=sid)

def updateGameOptions(game, gameCode):
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
        sio.emit('AvailableOptions', data, room=gameCode)

def sendPlayerLists(game, gameCode):
    teamsInfo = {}
    for key, team in game.teams.items():
        if team.player:
            teamsInfo[key] = [
                {'id': player.id, 'name': player.name, 'role': player.role}
                for player in team.player.values()
            ]
        else:
            teamsInfo[key] = []
    sio.emit('updatePlayerLists', teamsInfo, room=gameCode)

def startGame(gameCode, game):
    ballPosition = initializeBallPosition()
    ballDirection = initializeBallDirection()

    while True:
        ballPosition = updateBallPosition(ballPosition, ballDirection)
        ballDirection = handleCollisions(ballPosition, ballDirection, game, gameCode)
        sio.emit('gameState', {'ballPosition': ballPosition}, room=gameCode)
        eventlet.sleep(BALL_UPDATE_INTERVAL / 1000)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 3000)), app)
