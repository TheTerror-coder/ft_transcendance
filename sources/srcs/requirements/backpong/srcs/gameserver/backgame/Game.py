import logging
import sys
import random
import math
import requests
import os
import time
from .Team import Team
from .Player import Player

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
        self.collision_cooldown = 100  # ms
        self.last_collision_time = 0
        self.PREDICTION_BUFFER = []  # Pour stocker les positions futures
        self.MAX_PREDICTIONS = 3  # Nombre de prédictions à maintenir

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
        
        margin = 2.0
        isInZRange = (adjusted_hitbox['min']['z'] - margin) <= self.ballPosition['z'] <= (adjusted_hitbox['max']['z'] + margin)
        if not isInZRange:
            return 0
        
        margin_y = 0.5
        isInYRange = (adjusted_hitbox['min']['y'] - margin_y) <= self.ballPosition['y'] <= (adjusted_hitbox['max']['y'] + margin_y)
        if not isInYRange:
            return 0

        margin_edges = 1.5

        # Calculer la distance relative en Y
        relative_y_distance = abs(self.ballPosition['y'] - (adjusted_hitbox['max']['y'] + adjusted_hitbox['min']['y']) / 2)
        y_threshold = (adjusted_hitbox['max']['y'] - adjusted_hitbox['min']['y']) / 2

        if team.TeamId == 1:
            isOnLeftSide = (abs(self.ballPosition['x'] - adjusted_hitbox['min']['x']) <= margin_edges and 
                           self.ballPosition['y'] < adjusted_hitbox['max']['y'] and
                           relative_y_distance < y_threshold)
            isOnRightSide = (abs(self.ballPosition['x'] - adjusted_hitbox['max']['x']) <= margin_edges and 
                            self.ballPosition['y'] < adjusted_hitbox['max']['y'] and
                            relative_y_distance < y_threshold)
        else:
            isOnLeftSide = (abs(self.ballPosition['x'] - adjusted_hitbox['min']['x']) <= margin_edges and 
                           self.ballPosition['y'] > adjusted_hitbox['min']['y'])
            isOnRightSide = (abs(self.ballPosition['x'] - adjusted_hitbox['max']['x']) <= margin_edges and 
                            self.ballPosition['y'] > adjusted_hitbox['min']['y'])

        if isOnLeftSide:
            return 4
        if isOnRightSide:
            return 5

        isInXRange = adjusted_hitbox['min']['x'] <= self.ballPosition['x'] <= adjusted_hitbox['max']['x']
        if isInXRange:
            leftThird = adjusted_hitbox['min']['x'] + (adjusted_hitbox['max']['x'] - adjusted_hitbox['min']['x']) / 3
            rightThird = adjusted_hitbox['max']['x'] - (adjusted_hitbox['max']['x'] - adjusted_hitbox['min']['x']) / 3

            if self.ballPosition['x'] <= leftThird:
                return 2
            elif self.ballPosition['x'] >= rightThird:
                return 3
            return 1

        return 0

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
            if self.BALL_SPEED < self.BALL_MAX_SPEED:
                self.BALL_SPEED = min(
                    self.BALL_SPEED * self.SPEED_INCREASE_FACTOR,
                    self.BALL_MAX_SPEED
                )
                logger.info(f"Ball speed increased to: {self.BALL_SPEED}")
        elif self.ballPosition["x"] >= self.FIELD_WIDTH / 2:
            self.ballPosition["x"] = self.FIELD_WIDTH / 2 - 0.5
            self.ballDirection["x"] = -self.ballDirection["x"]
            if self.BALL_SPEED < self.BALL_MAX_SPEED:
                self.BALL_SPEED = min(
                    self.BALL_SPEED * self.SPEED_INCREASE_FACTOR,
                    self.BALL_MAX_SPEED
                )
                logger.info(f"Ball speed increased to: {self.BALL_SPEED}")

        collision = await self.detectCollisionWithBoats()

        if collision <= 0:
            pass
        elif collision == 1:  # Collision centrale
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            # Repositionner la balle au-dessus ou en-dessous selon la direction
            if self.ballDirection["y"] > 0:
                self.ballPosition["y"] = hitbox["min"]["y"] - 0.5
            else:
                self.ballPosition["y"] = hitbox["max"]["y"] + 0.5
            self.ballDirection["y"] = -self.ballDirection["y"]

        elif collision in [2, 3]:  # Collisions inclinées
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            
            # Calculer le point d'impact relatif par rapport au centre du bateau
            relativeIntersectX = self.ballPosition["x"] - (hitbox["min"]["x"] + (hitbox["max"]["x"] - hitbox["min"]["x"])/2)
            normalizedIntersect = relativeIntersectX / ((hitbox["max"]["x"] - hitbox["min"]["x"])/2)
            
            # Limiter l'angle de rebond
            if normalizedIntersect > 0.95:
                normalizedIntersect = 0.95
            elif normalizedIntersect < -0.95:
                normalizedIntersect = -0.95

            # Calculer la nouvelle direction en fonction du point d'impact
            if collision == 2:  # Côté gauche
                if self.ballPosition["y"] > 0:
                    self.ballPosition["y"] = hitbox["min"]["y"] - 0.5
                else:
                    self.ballPosition["y"] = hitbox["max"]["y"] + 0.5
                self.ballDirection["x"] = -abs(normalizedIntersect) * 1.2
            else:  # Côté droit
                if self.ballPosition["y"] > 0:
                    self.ballPosition["y"] = hitbox["min"]["y"] - 0.5
                else:
                    self.ballPosition["y"] = hitbox["max"]["y"] + 0.5
                self.ballDirection["x"] = abs(normalizedIntersect) * 1.2
            
            self.ballDirection["y"] = -self.ballDirection["y"]
            
            # Normalisation du vecteur
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length

        elif collision in [4, 5]:  # Collisions extrêmes
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            if collision == 4:  # Extrême gauche
                if hitbox['max']['x'] + 1.0 >= self.FIELD_WIDTH / 2:
                    return
                self.ballPosition["x"] = hitbox["max"]["x"] + 1.0
            else:  # Extrême droite
                if hitbox['min']['x'] - 1.0 <= -self.FIELD_WIDTH / 2:
                    return
                self.ballPosition["x"] = hitbox["min"]["x"] - 1.0

            # Calcul de la nouvelle direction avec un angle plus naturel
            if self.ballPosition["y"] > 0:
                angle_modifier = 0.3
            else:
                angle_modifier = -0.3
                
            self.ballDirection["y"] = -self.ballDirection["y"] + angle_modifier
            # Normalisation du vecteur
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length

        if self.ballPosition["y"] <= -self.FIELD_HEIGHT / 2:
            self.resetBall()
            self.teams[1].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore(),
                'gameCode': gameCode
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)
            logger.info(f"Points marqués - Team 1: {self.teams[1].getScore()}, Team 2: {self.teams[2].getScore()}")
        elif self.ballPosition["y"] >= self.FIELD_HEIGHT / 2:
            self.resetBall()
            self.teams[2].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore(),
                'gameCode': gameCode
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)
            logger.info(f"Points marqués - Team 1: {self.teams[1].getScore()}, Team 2: {self.teams[2].getScore()}")

        # Réduction de la vitesse si la balle va trop vite sans collision
        if self.BALL_SPEED > self.BALL_MIN_SPEED:
            self.BALL_SPEED = max(
                self.BALL_SPEED * 0.999,  # Réduction très progressive
                self.BALL_MIN_SPEED
            )

        self.last_collision_time = current_time

    def resetBall(self):
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()
        self.BALL_SPEED = self.BALL_INITIAL_SPEED  # Réinitialiser la vitesse

    def getBallPosition(self):
        return self.ballPosition
    
    

    def setIsPaused(self, isPaused):
        self.isPaused = isPaused

    def getIsPaused(self):
        return self.isPaused

    def addNbPlayerConnected(self):
        logger.info("addNbPlayerConnected")
        self.nbPlayerConnected += 1

    def removeNbPlayerConnected(self):
        logger.info("removeNbPlayerConnected")
        self.nbPlayerConnected -= 1

    def addPlayerReady(self):
        logger.info("addPlayerReady")
        self.playerReady += 1
        logger.info(f"playerReady: {self.playerReady}")

    def removePlayerReady(self):
        logger.info("removePlayerReady")
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

    def interpolate_points(self, p1, p2, steps=10):
        points = []
        for i in range(steps):
            t = i / steps
            x = p1['x'] + (p2['x'] - p1['x']) * t
            y = p1['y'] + (p2['y'] - p1['y']) * t
            z = p1['z'] + (p2['z'] - p1['z']) * t
            points.append({'x': x, 'y': y, 'z': z})
        return points

    async def updateBallFired(self, data):
        trajectory = data.get('trajectory')
        team = self.getTeam(data.get('team'))
        points_array = trajectory.get('geometries', [])[0].get('data', {}).get('attributes', {}).get('position', {}).get('array', [])
        
        # Convertir le tableau de points en liste de dictionnaires
        points = []
        for i in range(0, len(points_array), 3):
            points.append({
                'x': points_array[i],
                'y': points_array[i+1],
                'z': points_array[i+2]
            })
        
        # Vérifier les collisions avec interpolation
        for i in range(len(points) - 1):
            interpolated_points = self.interpolate_points(points[i], points[i+1])
            for point in interpolated_points:
                if self.check_collision_point(point, team):
                    return -1
        return 0

    def check_collision_point(self, point, firing_team):
        target_team = self.teams[1 if firing_team.getTeamId() == 2 else 2]
        hitbox = self.getAdjustedHitbox(target_team)
        
        return (hitbox['min']['x'] <= point['x'] <= hitbox['max']['x'] and
                hitbox['min']['y'] <= point['y'] <= hitbox['max']['y'] and
                hitbox['min']['z'] <= point['z'] <= hitbox['max']['z'])

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
            await self.sendGameInfo(sio, gameCode)
        elif self.teams[2].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[2].name, room=gameCode)
            self.gameStarted = False
            self.winner = self.teams[2]
            self.loser = self.teams[1]
            await self.sendGameInfo(sio, gameCode)                

    def createEndGamePayload(self):
            team1_player = next(iter(self.getTeam(1).player.values()))
            team2_player = next(iter(self.getTeam(2).player.values()))

            team1_score = self.getTeam(1).getScore()
            team2_score = self.getTeam(2).getScore()

            if team1_score > team2_score:
                winner = team1_player.name
            else:
                winner = team2_player.name

            payload = {
                'player': team1_player.name,
                'opponent': team2_player.name,
                'player_score': team1_score,
                'opponent_score': team2_score,
                'winner': winner
            }
            return payload
    
    async def sendGameInfo(self, sio, gameCode):
        if (self.nbPlayerPerTeam == 2):
            return
        ROOT_CA = os.getenv("GAMESERVER_ROOT_CA")
        backendServer_name = os.getenv("HOST_IP")
        backendServer_port = os.getenv("PROXYWAF_HTTPS_PORT")
        payload = self.createEndGamePayload()
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
