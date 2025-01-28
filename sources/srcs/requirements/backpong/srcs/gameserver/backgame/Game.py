import logging
import sys
import random
import math
import requests
import os
import time
import asyncio
from .Team import Team
from .Player import Player
from .Bullet_collide import *

# Configuration du logging au début du fichier
logging.basicConfig(
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    # stream=sys.stdout
)
logger = logging.getLogger(__name__)

class Game:
    def __init__(self, gameId, isGameTournament, tournament):
        self.gameId = gameId
        self.gameInterval = None
        self.tickRate = 1000 / 60
        self.gameStarted = False
        self.teams = {}
        self.nbPlayerPerTeam = 0
        self.nbPlayerConnected = 0
        self.playerReady = 0
        self.isPaused = False
        self.winner = None
        self.loser = None
        self.isGameTournament = isGameTournament
        self.tournament = tournament
        self.gameInLobby = True
        self.nbPlayerInLobby = 0
        self.isLaunch = False
        
        # Constantes pour la balle
        self.BALL_INITIAL_SPEED = 1.5     # Vitesse initiale
        self.BALL_SPEED = self.BALL_INITIAL_SPEED
        self.SPEED_INCREASE_FACTOR = 1.1  # Facteur d'augmentation (réduit de 1.2 à 1.1)
        self.BALL_MAX_SPEED = 3.0         # Vitesse maximale augmentée
        self.BALL_MIN_SPEED = 1.0         # Vitesse minimale
        self.BALL_UPDATE_INTERVAL = 33    # ~30fps
        self.FIELD_WIDTH = 150
        self.FIELD_HEIGHT = 105

        self.WINNING_SCORE = 5

        # État de la balle
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()
        self.last_ball_update = 0
        self.ball_velocity = {'x': 0, 'y': 0, 'z': 0}
        self.collision_cooldown = 50  # ms
        self.last_collision_time = 0
        self.PREDICTION_BUFFER = []  # Pour stocker les positions futures
        self.MAX_PREDICTIONS = 3  # Nombre de prédictions à maintenir
        self.pending_hits = {}  # {gameCode: {teamId: {timestamp, damage, animationEndTime}}}
        self.DISCONNECT_TIMEOUT = 30  # 30 secondes
        self.disconnect_timers = {}  # {team_id: {sid: timer}}
        self.disconnected_players = {}  # {team_id: [sid]}

    async def launchCheckGameFull(self, sio, gameCode):
        logger.info(f"launchCheckGameFull dans Game.py")
        gameIsFullMsgSend = False
        while True:
            if not gameIsFullMsgSend and self.getTeam(1).getIsFull() and self.getTeam(2).getIsFull():
                await sio.emit('TeamsFull', room=gameCode)
                gameIsFullMsgSend = True
                logger.info(f"TeamsFull envoyé dans Game.py")
            if ((self.getTeam(1).getNbPlayer() == 0 or self.getTeam(2).getNbPlayer() == 0) or (self.getTeam(1).getNbPlayer() == 0 and self.getTeam(2).getNbPlayer() == 0)):
                gameIsFullMsgSend = False
            if (self.gameStarted):
                return
            await asyncio.sleep(1)
            
    def setIsLaunch(self, isLaunch):
        self.isLaunch = isLaunch
        
    def getIsLaunch(self):
        return self.isLaunch
        
    def setGameInLobby(self, gameInLobby):
        self.gameInLobby = gameInLobby

    def getGameInLobby(self):
        return self.gameInLobby
    
    def addNbPlayerInLobby(self):
        self.nbPlayerInLobby += 1
        logger.info(f'nbPlayerInLobby : {self.nbPlayerInLobby}')
    
    def getNbPlayerInLobby(self):
        logger.info(f'self.nbPlayerInLobby : {self.nbPlayerInLobby}')
        return self.nbPlayerInLobby
    
    def removeNbPlayerInLobby(self, nbPlayerToRemove):
        logger.info(f'removeNbPlayerInLobby : {self.nbPlayerInLobby}')
        logger.info(f'nbPlayerToRemove : {nbPlayerToRemove}')
        logger.info(f'self.nbPlayerInLobby - nbPlayerToRemove >= 0 : {self.nbPlayerInLobby - nbPlayerToRemove >= 0}')
        if (self.nbPlayerInLobby - nbPlayerToRemove >= 0):
            logger.info(f'remove nbPlayerInLobby : {self.nbPlayerInLobby}')
            self.nbPlayerInLobby -= nbPlayerToRemove
        else:
            logger.info(f'remove nbPlayerInLobby : {self.nbPlayerInLobby}')
            self.nbPlayerInLobby = 0

    def getIsGameTournament(self):
        return self.isGameTournament
    
    def getTournament(self):
        return self.tournament
    
    def getWinner(self):
        return self.winner
    
    def getLoser(self):
        return self.loser

    def getGameId(self):
        return self.gameId

    def initializeBallPosition(self):
        return {"x": 0, "y": 0, "z": 2}

    def initializeBallDirection(self):
        
        random_direction_x = random.random() * 2 - 1
        
        random_direction_y = random.random() * 0.4 + 0.4
        if random.random() < 0.5: 
            random_direction_y = -random_direction_y

        length = math.sqrt(random_direction_x ** 2 + random_direction_y ** 2)
        random_direction_x /= length
        random_direction_y /= length

        return {
            "x": random_direction_x,
            "y": random_direction_y,
            "z": 2
        }

    async def updateBallPosition(self):
        if self.gameStarted:
            current_time = time.time() * 1000
            delta_time = current_time - self.last_ball_update
            
            if delta_time < self.BALL_UPDATE_INTERVAL:
                return self.ballPosition
            
            # Calculer la vélocité avec plus de précision
            self.ball_velocity = {
                'x': self.ballDirection['x'] * self.BALL_SPEED,
                'y': self.ballDirection['y'] * self.BALL_SPEED,
                'z': 0
            }
            
            # Mise à jour de la position avec la vélocité
            new_position = {
                'x': self.ballPosition['x'] + self.ball_velocity['x'],
                'y': self.ballPosition['y'] + self.ball_velocity['y'],
                'z': self.ballDirection['z']
            }
            
            # Mettre à jour la position actuelle
            self.ballPosition = new_position
            self.last_ball_update = current_time
            
            # Générer quelques positions futures pour la prédiction
            self.PREDICTION_BUFFER = [
                {
                    'x': new_position['x'] + self.ball_velocity['x'] * i,
                    'y': new_position['y'] + self.ball_velocity['y'] * i,
                    'z': new_position['z']
                } for i in range(1, self.MAX_PREDICTIONS + 1)
            ]
            
        return self.ballPosition

    def getAdjustedHitbox(self, team):
        hitbox = team.getBoatHitbox()
        boatPos = team.getBoat()
        
        if not hitbox or not boatPos:
            return -1

        formerBoatPos = team.getFormerBoatPosition()
        dx = boatPos['x'] - formerBoatPos['x']

        adjusted_hitbox = {
            'min': {
                'x': hitbox['min']['x'] + dx,
                'y': hitbox['min']['y'] + boatPos['y'],
                'z': hitbox['min']['z']
            },
            'max': {
                'x': hitbox['max']['x'] + dx,
                'y': hitbox['max']['y'] + boatPos['y'],
                'z': hitbox['max']['z']
            }
        }
        return adjusted_hitbox

    async def isColliding(self, team):
        adjusted_hitbox = self.getAdjustedHitbox(team)
        if adjusted_hitbox == -1:
            return 0
        
        # Marges de collision
        margin_z = 2.5
        margin_y = 1.0
        margin_x = 2.0

        # Vérification des collisions sur les trois axes
        isInZRange = (adjusted_hitbox['min']['z'] - margin_z) <= self.ballPosition['z'] <= (adjusted_hitbox['max']['z'] + margin_z)
        if not isInZRange:
            return 0
        
        isInYRange = (adjusted_hitbox['min']['y'] - margin_y) <= self.ballPosition['y'] <= (adjusted_hitbox['max']['y'] + margin_y)
        if not isInYRange:
            return 0

        isInXRange = (adjusted_hitbox['min']['x'] - margin_x) <= self.ballPosition['x'] <= (adjusted_hitbox['max']['x'] + margin_x)
        if not isInXRange:
            return 0

        # Calculer le point d'impact relatif par rapport au centre du paddle
        relativeIntersectX = self.ballPosition['x'] - (adjusted_hitbox['min']['x'] + (adjusted_hitbox['max']['x'] - adjusted_hitbox['min']['x'])/2)
        normalizedIntersect = relativeIntersectX / ((adjusted_hitbox['max']['x'] - adjusted_hitbox['min']['x'])/2)
        
        # Retourner 1 pour une collision normale
        return 1

    async def detectCollisionWithBoats(self):
        for key, team in self.teams.items():
            boat_pos = team.getBoat()
            if boat_pos['x'] == 0 and boat_pos['y'] == 0:
                continue
            collision = await self.isColliding(team)
            if collision > 0:
                return collision
        return -1

    async def handleCollisions(self, sio, gameCode):
        current_time = time.time() * 1000
        
        if current_time - self.last_collision_time < self.collision_cooldown:
            return
            
        if not self.gameStarted:
            return

        # Gestion des collisions avec les murs latéraux
        if self.ballPosition["x"] <= -self.FIELD_WIDTH / 2:
            self.ballPosition["x"] = -self.FIELD_WIDTH / 2 + 0.5
            self.ballDirection["x"] = -self.ballDirection["x"]
            self.BALL_SPEED = min(self.BALL_SPEED * self.SPEED_INCREASE_FACTOR, self.BALL_MAX_SPEED)
        elif self.ballPosition["x"] >= self.FIELD_WIDTH / 2:
            self.ballPosition["x"] = self.FIELD_WIDTH / 2 - 0.5
            self.ballDirection["x"] = -self.ballDirection["x"]
            self.BALL_SPEED = min(self.BALL_SPEED * self.SPEED_INCREASE_FACTOR, self.BALL_MAX_SPEED)

        # Détection des collisions avec les paddles
        collision = await self.detectCollisionWithBoats()
        
        if collision == 1:  # Collision normale
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            
            # Calculer l'angle de rebond basé sur le point d'impact
            relativeIntersectX = self.ballPosition["x"] - (hitbox["min"]["x"] + (hitbox["max"]["x"] - hitbox["min"]["x"])/2)
            normalizedIntersect = relativeIntersectX / ((hitbox["max"]["x"] - hitbox["min"]["x"])/2)
            
            # Limiter l'angle de rebond
            bounceAngle = normalizedIntersect * (math.pi / 4)  # 45 degrés maximum
            
            # Mettre à jour la direction
            self.ballDirection["x"] = math.sin(bounceAngle)
            self.ballDirection["y"] = -sign(self.ballDirection["y"]) * math.cos(bounceAngle)
            
            # Normaliser le vecteur direction
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length
            
            # Augmenter la vitesse
            self.BALL_SPEED = min(self.BALL_SPEED * self.SPEED_INCREASE_FACTOR, self.BALL_MAX_SPEED)

        # Gestion des points
        if self.ballPosition["y"] <= -self.FIELD_HEIGHT / 2:
            self.resetBall()
            self.teams[1].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore(),
                'gameCode': gameCode
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)
        elif self.ballPosition["y"] >= self.FIELD_HEIGHT / 2:
            self.resetBall()
            self.teams[2].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore(),
                'gameCode': gameCode
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)

        self.last_collision_time = current_time

    def resetBall(self):
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()
        self.BALL_SPEED = self.BALL_INITIAL_SPEED  # Réinitialiser la vitesse

    def getBallPosition(self):
        return self.ballPosition
    
    def getPlayerByName(self, name):
        for team in self.teams.values():
            for player in team.player.values():
                logger.info(f"player.name dans getPlayerByName {player.name}, {name}")
                if player.name == name:
                    return player
        return None

    def setIsPaused(self, isPaused):
        self.isPaused = isPaused

    def getIsPaused(self):
        return self.isPaused

    def addNbPlayerConnected(self):
        logger.info("addNbPlayerConnected")
        self.nbPlayerConnected += 1

    def removeNbPlayerConnected(self):
        logger.info("removeNbPlayerConnected")
        if (self.nbPlayerConnected > 0):
            self.nbPlayerConnected -= 1

    def addPlayerReady(self):
        logger.info("addPlayerReady")
        self.playerReady += 1
        logger.info(f"playerReady: {self.playerReady}")

    def removePlayerReady(self):
        logger.info("removePlayerReady")
        if (self.playerReady > 0):
            self.playerReady -= 1

    def getPlayerReady(self):
        return self.playerReady

    def setNbPlayerPerTeam(self, nbPlayerPerTeam):
        logger.info("setNbPlayerPerTeam")
        self.nbPlayerPerTeam = nbPlayerPerTeam

    def setTeam(self, team):
        teamId = team.getTeamId()
        self.teams[teamId] = team
        logger.info(f"Team added to game {self.gameId}: {team.getName()} with {len(team.player)} players")

    def getTeam(self, TeamID):
        return self.teams.get(TeamID)

    def getNbPlayerPerTeam(self):
        return self.nbPlayerPerTeam

    def removeTeam(self, team):
        if team.TeamId in self.teams:
            del self.teams[team.TeamId]
            logger.info(f"Team {team.getName()} (ID: {team.TeamId}) removed from game {self.gameId}")
            return True
        return False

    async def updateBoatPosition(self, teamId, x):
        team = self.getTeam(teamId)
        if team:
            boat = team.getBoat()
            if boat:
                team.setBoatPosition(x)
            else:
                logger.info(f"Boat not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")

    def findPlayerById(self, playerId):
        for team in self.teams.values():
            for player in team.player.values():
                if player.id == playerId:
                    return player
        return None

    def findPlayerByName(self, playerName):
        for team in self.teams.values():
            for player in team.player.values():
                if player.name == playerName:
                    return player
        return None
    
    def findTeamByPlayerName(self, playerName):
        for team in self.teams.values():
            for player in team.player.values():
                if player.name == playerName:
                    return team
        return None

    async def updateCannonPosition(self, teamId, x):
        team = self.getTeam(teamId)
        if team:
            cannon = team.getCannon()
            if cannon:
                team.setCannonPosition(x)
                logger.info(f"cannon: {cannon}")
            else:
                logger.info(f"Cannon not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")

    async def updateCannonRotation(self, teamId, y):
        team = self.getTeam(teamId)
        if team:
            cannon = team.getCannon()
            if cannon:
                team.setCannonRotation(y)
            else:
                logger.info(f"Cannon not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")
    
    async def updateBallFired(self, data):
        trajectory = data.get('trajectory')
        team = self.getTeam(data.get('team'))
        animation_end_time = data.get('animationEndTime')
        game_code = data.get('gameCode')

        try:
            # Vérifier les collisions comme avant
            collision_detected = False
            collision_point = None
            
            for i in range(0, len(trajectory) - 3, 3):
                p1 = {
                    'x': float(trajectory[i]),
                    'y': float(trajectory[i+1]),
                    'z': float(trajectory[i+2])
                }
                p2 = {
                    'x': float(trajectory[i+3]),
                    'y': float(trajectory[i+4]),
                    'z': float(trajectory[i+5])
                }

                if self.checkCollisionSegment(p1, p2, team):
                    collision_detected = True
                    collision_point = p2
                    break

            if collision_detected:
                # Au lieu d'appliquer les dégâts immédiatement, les stocker
                self.pending_hits[game_code] = {
                    'teamId': team.getTeamId(),
                    'timestamp': time.time(),
                    'animationEndTime': animation_end_time,
                    'collision_point': collision_point
                }
                return 1  # Collision détectée
            return 0  # Pas de collision

        except Exception as e:
            logger.error(f"Erreur dans updateBallFired: {e}")
            return -1
    
    def checkCollisionSegment(self, p1, p2, firing_team):
        target_team = self.teams[1 if firing_team.getTeamId() == 2 else 2]
        current_hitbox = self.getAdjustedHitbox(target_team)
        
        # Vérifier la collision avec la position actuelle
        collision, point = checkCollision(p1, p2, current_hitbox)
        if collision:
            return True
        
        # Vérifier avec les positions futures du bateau
        boat_velocity = {
            'x': target_team.getBoat()['x'] - target_team.getFormerBoatPosition()['x'],
            'y': target_team.getBoat()['y'] - target_team.getFormerBoatPosition()['y']
        }
        
        # Vérifier quelques positions futures
        for i in range(1, 5):  # Vérifier 5 positions futures
            future_hitbox = {
                'min': {
                    'x': current_hitbox['min']['x'] + boat_velocity['x'] * i,
                    'y': current_hitbox['min']['y'] + boat_velocity['y'] * i,
                    'z': current_hitbox['min']['z']
                },
                'max': {
                    'x': current_hitbox['max']['x'] + boat_velocity['x'] * i,
                    'y': current_hitbox['max']['y'] + boat_velocity['y'] * i,
                    'z': current_hitbox['max']['z']
                }
            }
            collision, point = checkCollision(p1, p2, future_hitbox)
            if collision:
                return True
            
        return False

    async def updateClientData(self, data):
        teamId = data.get('team')
        boat = data.get('boat', {})
        cannon = data.get('cannon', {})
        hitbox = data.get('boatHitbox')
        logger.info(f"updateClientData teamId: {teamId} boat: {boat} cannon: {cannon} hitbox: {hitbox}")

        if teamId:
            team = self.getTeam(teamId)
            if team:
                if boat:
                    team.setBoatPosClient(boat['x'], boat['y'], boat['z'])
                if cannon:
                    team.setCannonPosClient(cannon['x'], cannon['y'], cannon['z'])
                    logger.info(f"cannon UPDATED: {cannon}")
                if hitbox:
                    team.setBoatHitbox(hitbox)
            else:
                logger.error(f"Team {teamId} not found")

    def createConnectGameData(self):
        logger.info("createGameData")
        team1_players = {
            player.id: {  # Utiliser directement l'id comme clé
                'id': player.id,
                'role': player.role,
                'name': player.name
            } for player in self.getTeam(1).player.values()
        }
        
        team2_players = {
            player.id: {  # Utiliser directement l'id comme clé
                'id': player.id,
                'role': player.role,
                'name': player.name
            } for player in self.getTeam(2).player.values()
        }

        teamsArray = {
            'team1': {
                'TeamId': self.getTeam(1).TeamId,
                'Name': self.getTeam(1).name,
                'MaxNbPlayer': self.getTeam(1).maxNbPlayer,
                'NbPlayer': self.getTeam(1).nbPlayer,
                'Boat': self.getTeam(1).boat,
                'Cannon': self.getTeam(1).cannon,
                'Player': team1_players,
                'IsFull': self.getTeam(1).isFull,
            },
            'team2': {
                'TeamId': self.getTeam(2).TeamId,
                'Name': self.getTeam(2).name,
                'MaxNbPlayer': self.getTeam(2).maxNbPlayer,
                'NbPlayer': self.getTeam(2).nbPlayer,
                'Boat': self.getTeam(2).boat,
                'Cannon': self.getTeam(2).cannon,
                'Player': team2_players,
                'IsFull': self.getTeam(2).isFull,
            }
        }
        return (teamsArray)
    
    def createReconnectGameData(self):
        logger.info("createReconnectGameData")
        team1_players = {
            player.id: {  # Utiliser directement l'id comme clé
                'id': player.id,
                'role': player.role,
                'name': player.name
            } for player in self.getTeam(1).player.values()
        }
        
        team2_players = {
            player.id: {  # Utiliser directement l'id comme clé
                'id': player.id,
                'role': player.role,
                'name': player.name
            } for player in self.getTeam(2).player.values()
        }

        gameData = {
            'team1': {
                'TeamId': self.getTeam(1).TeamId,
                'Name': self.getTeam(1).name,
                'MaxNbPlayer': self.getTeam(1).maxNbPlayer,
                'NbPlayer': self.getTeam(1).nbPlayer,
                'Boat': self.getTeam(1).boat,
                'Cannon': self.getTeam(1).cannon,
                'Player': team1_players,
                'IsFull': self.getTeam(1).isFull,
                'Score': self.getTeam(1).score,
            },
            'team2': {
                'TeamId': self.getTeam(2).TeamId,
                'Name': self.getTeam(2).name,
                'MaxNbPlayer': self.getTeam(2).maxNbPlayer,
                'NbPlayer': self.getTeam(2).nbPlayer,
                'Boat': self.getTeam(2).boat,
                'Cannon': self.getTeam(2).cannon,
                'Player': team2_players,
                'IsFull': self.getTeam(2).isFull,
                'Score': self.getTeam(2).score,
            },
            'ball': self.ballPosition
        }
        return (gameData)

    async def sendGameData(self, sio, gameCode, sid, originalGameCode, isTournament):
        logger.info(f"sendGameData to {gameCode} / {originalGameCode}")
        # Convertir les objets Player en format attendu par le client
        
        if (sid):
            gameData = self.createReconnectGameData()
            logger.info(f"Sending gameData {gameData} to the reconnected player with sid : {sid}")
            await sio.emit('gameData', gameData, room=sid)
            # player.setIsInit(True)
        else:
            teamsArray = self.createConnectGameData()
            logger.info(f'Sending gameData: {teamsArray} to the gameCode: {gameCode} / {originalGameCode}')
            if (isTournament):
                await sio.emit('gameData', teamsArray, room=originalGameCode)
            else:
                await sio.emit('gameData', teamsArray, room=gameCode)
    
    async def updateBoatAndCannonPosition(self, teamId, boatX, boatY, boatZ, cannonX, cannonY, cannonZ):
        await self.updateBoatPosition(teamId, boatX, boatY, boatZ)
        await self.updateCannonPosition(teamId, cannonX, cannonY, cannonZ)

    async def checkWinner(self, sio, gameCode):
        if self.teams[1].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[1].name, room=gameCode)
            self.gameStarted = False
            self.winner = self.teams[1]
            self.loser = self.teams[2]
            await self.sendGameInfo(sio, gameCode, False)
        elif self.teams[2].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[2].name, room=gameCode)
            self.gameStarted = False
            self.winner = self.teams[2]
            self.loser = self.teams[1]
            await self.sendGameInfo(sio, gameCode, False)                

    def createEndGamePayload(self, isForfeit):
        team1_player = next(iter(self.getTeam(1).player.values()))
        team2_player = next(iter(self.getTeam(2).player.values()))
        
        if (team1_player.TeamID == self.winner.getTeamId()):
            winner = team1_player.name
            loser = team2_player.name
        else:
            winner = team2_player.name
            loser = team1_player.name
        
        if (isForfeit):
            payload = {
                'player': winner,
                'opponent': loser,
                'player_score': 99,
                'opponent_score': 0,
                'winner': winner
            }
            return payload
        
        payload = {
            'player': winner,
            'opponent': loser,
            'player_score': self.winner.getScore(),
            'opponent_score': self.loser.getScore(),
            'winner': winner
        }
        return payload
    
    async def sendGameInfo(self, sio, gameCode, isForfeit):
        if (self.nbPlayerPerTeam == 2):
            return
        ROOT_CA = os.getenv("GAMESERVER_ROOT_CA")
        backendServer_name = os.getenv("HOST_IP")
        backendServer_port = os.getenv("PROXYWAF_HTTPS_PORT")
        payload = self.createEndGamePayload(isForfeit)
        logger.info(f"payload: {payload}")
        request = requests.post("https://" + backendServer_name + ":" + backendServer_port + "/backpong/user-management/set-info-game/", verify=ROOT_CA, data=payload)
        logger.info(f"request: {request}")

    def printGameDetails(self):
        logger.info("=== DÉTAILS DE LA PARTIE ===")
        logger.info(f"ID de la partie: {self.gameId}")
        logger.info(f"État de la partie: {'En cours' if self.gameStarted else 'Non démarrée'}")
        logger.info(f"Partie de tournoi: {'Oui' if self.isGameTournament else 'Non'}")
        logger.info(f"Joueurs connectés: {self.nbPlayerConnected}/{self.nbPlayerPerTeam * 2}")
        logger.info(f"Joueurs prêts: {self.playerReady}")
        logger.info(f"Partie en pause: {'Oui' if self.isPaused else 'Non'}")
        
        # Informations sur la balle
        logger.info("--- État de la balle ---")
        logger.info(f"Position: x={self.ballPosition['x']:.2f}, y={self.ballPosition['y']:.2f}, z={self.ballPosition['z']:.2f}")
        logger.info(f"Vitesse actuelle: {self.BALL_SPEED:.2f}")
        logger.info(f"Direction: x={self.ballDirection['x']:.2f}, y={self.ballDirection['y']:.2f}, z={self.ballDirection['z']:.2f}")
        
        # Informations sur les équipes
        for team_id, team in self.teams.items():
            logger.info(f"--- ÉQUIPE {team_id} ---")
            logger.info(f"Nom: {team.name}")
            logger.info(f"Score: {team.getScore()}")
            logger.info(f"Nombre de joueurs: {team.nbPlayer}/{team.maxNbPlayer}")
            
            # Position du bateau
            boat_pos = team.getBoat()
            logger.info(f"Position du bateau: x={boat_pos['x']:.2f}, y={boat_pos['y']:.2f}, z={boat_pos['z']:.2f}")
            
            # Position du canon
            cannon_pos = team.getCannon()
            logger.info(f"Position du canon: x={cannon_pos['x']:.2f}, y={cannon_pos['y']:.2f}, z={cannon_pos['z']:.2f}")
            
            # Détails des joueurs
            logger.info("Joueurs:")
            for player_id, player in team.player.items():
                logger.info(f"  - ID: {player.id}")
                logger.info(f"    Nom: {player.name}")
                logger.info(f"    Rôle: {player.role}")
        
        if self.winner:
            logger.info(f"Gagnant: {self.winner.name}")
            logger.info(f"Perdant: {self.loser.name}")
        
        logger.info("=== FIN DES DÉTAILS ===")

    def resetGameState(self):
        self.gameStarted = False
        self.isPaused = False
        self.winner = None
        self.loser = None
        self.playerReady = 0
        self.nbPlayerConnected = 0
        self.BALL_SPEED = self.BALL_INITIAL_SPEED
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()
        self.last_ball_update = 0
        self.ball_velocity = {'x': 0, 'y': 0, 'z': 0}
        self.last_collision_time = 0
        self.PREDICTION_BUFFER = []
        self.tournament = None
        self.isGameTournament = False
        
        # Réinitialiser les équipes
        for team in self.teams.values():
            team.resetPosition()
            team.PV = 100
            team.score = 0

    async def handleAnimationComplete(self, sio, data, sid):
        gameCode = data.get('gameCode')
        team_id = data.get('team')
        
        if gameCode in self.pending_hits:
            hit_data = self.pending_hits[gameCode]
            if hit_data['teamId'] == team_id:
                # Appliquer les dégâts
                target_team = self.teams[1 if team_id == 2 else 2]
                target_team.removePV(10)
                logger.info(f"target_team: {target_team.getPV()}")
                # Envoyer la mise à jour aux clients
                await sio.emit('damageApplied', {
                    'gameCode': gameCode,
                    'teamId': target_team.getTeamId(),
                    'damage': 10,
                    'health': target_team.getPV()
                }, room=gameCode)

                if (target_team.getPV() <= 0):
                    self.winner = self.teams[1 if target_team.getTeamId() == 2 else 2]
                    self.loser = self.teams[1 if target_team.getTeamId() == 1 else 2]
                    self.gameStarted = False
                    await self.sendGameInfo(sio, gameCode, True)
                    await sio.emit('winner', self.winner.getName(), room=gameCode)
                
                # Nettoyer les données
                del self.pending_hits[gameCode]

    async def handle_disconnect(self, sid, sio, gameCode):
        if self.isGameTournament:
            # Pour les tournois : forfait immédiat
            for team in self.teams.values():
                if team.getPlayerById(sid):
                    self.loser = team
                    self.winner = self.teams[1 if team.getTeamId() == 2 else 2]
                    self.gameStarted = False
                    await self.sendGameInfo(sio, gameCode, True)
                    await sio.emit('winner', self.winner.getName(), room=gameCode)
                    return True  # Indique que c'est une déconnexion de tournoi
            return True

        # Trouver l'équipe du joueur
        player_team = None
        for team_id, team in self.teams.items():
            if team.getPlayerById(sid):
                player_team = team
                team_id = team.getTeamId()
                break

        if not player_team:
            return False

        # Initialiser les structures pour cette équipe si nécessaire
        if team_id not in self.disconnect_timers:
            self.disconnect_timers[team_id] = {}
            self.disconnected_players[team_id] = []

        # Ajouter le joueur à la liste des déconnectés
        self.disconnected_players[team_id].append(sid)
        
        # Créer un timer pour ce joueur
        self.disconnect_timers[team_id][sid] = asyncio.create_task(
            self.disconnect_countdown(team_id, sid, sio, gameCode)
        )

        # Si toute l'équipe est déconnectée, démarrer un timer plus court
        if len(self.disconnected_players[team_id]) == player_team.nbPlayer:
            for sid in self.disconnected_players[team_id]:
                if sid in self.disconnect_timers[team_id]:
                    self.disconnect_timers[team_id][sid].cancel()
            self.disconnect_timers[team_id]['team'] = asyncio.create_task(
                self.team_disconnect_countdown(team_id, sio, gameCode)
            )
        logger.info(f"Joueur déconnecté: {sid}")
        return False

    async def disconnect_countdown(self, team_id, sid, sio, gameCode):
        """Compte à rebours pour un joueur"""
        try:
            await asyncio.sleep(self.DISCONNECT_TIMEOUT)
            
            # Vérifier si le joueur est toujours déconnecté
            player = self.teams[team_id].getPlayerById(sid)
            if player and not player.getOnline():
                # Mettre à jour allowedToReconnect quand le timer expire
                player.setAllowedToReconnect(False)
                
                # Déclarer l'autre équipe gagnante
                self.loser = self.teams[team_id]
                self.winner = self.teams[1 if team_id == 2 else 2]
                self.gameStarted = False
                
                # Notifier tous les joueurs de la fin de la partie
                await self.sendGameInfo(sio, gameCode, True)
                await sio.emit('winner', self.winner.getName(), room=gameCode)

        finally:
            self.cleanup_player_disconnect(team_id, sid)

    def cleanup_player_disconnect(self, team_id, sid):
        """Nettoie les données de déconnexion d'un joueur"""
        if team_id in self.disconnect_timers:
            if sid in self.disconnect_timers[team_id]:
                del self.disconnect_timers[team_id][sid]
            if sid in self.disconnected_players[team_id]:
                self.disconnected_players[team_id].remove(sid)

    def cleanup_team_disconnect(self, team_id):
        """Nettoie toutes les données de déconnexion d'une équipe"""
        if team_id in self.disconnect_timers:
            del self.disconnect_timers[team_id]
        if team_id in self.disconnected_players:
            del self.disconnected_players[team_id]

    def handle_reconnect(self, sid):
        """Gère la reconnexion d'un joueur"""
        # Trouver le joueur par son nouveau sid
        reconnecting_player = None
        reconnecting_team_id = None
        
        for team_id, team in self.teams.items():
            for player in team.player.values():
                if player.getId() == sid:
                    reconnecting_player = player
                    reconnecting_team_id = team_id
                    break
            if reconnecting_player:
                break

        if not reconnecting_player:
            return False

        # D'abord vérifier si le joueur est autorisé à se reconnecter
        if not reconnecting_player.getAllowedToReconnect():
            return False

        # Ensuite vérifier si le timer est toujours actif
        if reconnecting_team_id in self.disconnect_timers:
            for disconnected_sid in self.disconnected_players.get(reconnecting_team_id, []):
                if team_id == reconnecting_team_id:  # Même équipe
                    # Annuler les timers
                    if disconnected_sid in self.disconnect_timers[team_id]:
                        self.disconnect_timers[team_id][disconnected_sid].cancel()
                    if 'team' in self.disconnect_timers[team_id]:
                        self.disconnect_timers[team_id]['team'].cancel()
                    
                    # Nettoyer les données de déconnexion
                    self.cleanup_player_disconnect(team_id, disconnected_sid)
                    return True

        return False

    async def team_disconnect_countdown(self, team_id, sio, gameCode):
        """Compte à rebours plus court pour une équipe entière déconnectée"""
        try:
            await asyncio.sleep(10)  # Timer plus court pour une équipe complète
            self.loser = self.teams[team_id]
            self.winner = self.teams[1 if team_id == 2 else 2]
            self.gameStarted = False
            
            # Notifier tous les joueurs de la fin de la partie
            await self.sendGameInfo(sio, gameCode, True)
            await sio.emit('winner', self.winner.getName(), room=gameCode)
            
        finally:
            self.cleanup_team_disconnect(team_id)

def sign(x):
    return -1 if x < 0 else 1 if x > 0 else 0

