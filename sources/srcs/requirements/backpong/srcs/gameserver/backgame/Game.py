import logging
import sys
import random
import math
import requests
import os

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
    def __init__(self):
        self.gameInterval = None
        self.tickRate = 1000 / 60
        self.gameStarted = False
        self.teams = {}
        self.nbPlayerPerTeam = 0
        self.nbPlayerConnected = 0
        self.playerReady = 0
        self.isPaused = False
        
        # Constantes pour la balle
        self.BALL_SPEED = 1
        self.SPEED_INCREASE_FACTOR = 1.1
        self.BALL_MAX_SPEED = 1.8
        self.BALL_UPDATE_INTERVAL = 50
        self.FIELD_WIDTH = 150
        self.FIELD_HEIGHT = 105

        self.WINNING_SCORE = 10

        # État de la balle
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()

    def initializeBallPosition(self):
        return {"x": 0, "y": 0, "z": 2}

    def initializeBallDirection(self):
        
        # Génération de x entre -1 et 1
        random_direction_x = random.random() * 2 - 1
        
        # Génération de y entre 0.4 et 0.8 pour un mouvement vertical plus modéré
        random_direction_y = random.random() * 0.4 + 0.4  # Entre 0.4 et 0.8
        if random.random() < 0.5:  # 50% de chance d'aller vers le bas
            random_direction_y = -random_direction_y

        # Normalisation du vecteur
        length = math.sqrt(random_direction_x ** 2 + random_direction_y ** 2)
        random_direction_x /= length
        random_direction_y /= length

        return {
            "x": random_direction_x,
            "y": random_direction_y,
            "z": 2
        }

        # return {
        #     "x": 0,
        #     "y": 1,
        #     "z": 2
        # }

    async def updateBallPosition(self):
        if self.gameStarted:
            # Vérifier que la balle a une vitesse minimale
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            if length < 0.1:
                # Normaliser avec une vitesse minimale
                self.ballDirection["x"] *= 1.0 / length
                self.ballDirection["y"] *= 1.0 / length
                
            self.ballPosition["x"] += self.ballDirection["x"] * self.BALL_SPEED
            self.ballPosition["y"] += self.ballDirection["y"] * self.BALL_SPEED
            
            # Ajouter des logs pour le debugging
            logger.info(f"Ball direction: {self.ballDirection}")
            logger.info(f"Ball speed: {self.BALL_SPEED}")
            
        return self.ballPosition
    
    def getAdjustedHitbox(self, team):
        hitbox = team.getBoatHitbox()
        boatPos = team.getBoat()
        
        if not hitbox or not boatPos:
            return -1

        # Calculer le déplacement du bateau
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
        
        # Ajouter des logs pour débugger les positions
        # logger.info(f"Ball position: {self.ballPosition}")
        # logger.info(f"Adjusted hitbox: {adjusted_hitbox}")
        
        # Vérifier d'abord si on est dans la zone Z
        margin = 2.0
        isInZRange = (adjusted_hitbox['min']['z'] - margin) <= self.ballPosition['z'] <= (adjusted_hitbox['max']['z'] + margin)
        if not isInZRange:
            # logger.info("Not in Z range")
            return 0
        
        # Vérifier la zone Y
        margin_y = 0.5  # Marge plus petite pour Y
        isInYRange = (adjusted_hitbox['min']['y'] - margin_y) <= self.ballPosition['y'] <= (adjusted_hitbox['max']['y'] + margin_y)
        if not isInYRange:
            # logger.info("Not in Y range")
            return 0

        # Vérification des bords
        margin_edges = 3.0  # Marge plus grande pour les bords
        # Pour team 1 (bateau en bas)
        if team.TeamId == 1:
            isOnLeftSide = (abs(self.ballPosition['x'] - adjusted_hitbox['min']['x']) <= margin_edges and 
                           self.ballPosition['y'] < adjusted_hitbox['max']['y'])
            isOnRightSide = (abs(self.ballPosition['x'] - adjusted_hitbox['max']['x']) <= margin_edges and 
                            self.ballPosition['y'] < adjusted_hitbox['max']['y'])
        # Pour team 2 (bateau en haut)
        else:
            isOnLeftSide = (abs(self.ballPosition['x'] - adjusted_hitbox['min']['x']) <= margin_edges and 
                           self.ballPosition['y'] > adjusted_hitbox['min']['y'])
            isOnRightSide = (abs(self.ballPosition['x'] - adjusted_hitbox['max']['x']) <= margin_edges and 
                            self.ballPosition['y'] > adjusted_hitbox['min']['y'])
        
        logger.info(f"ballPosition: {self.ballPosition}")
        logger.info(f"team.TeamId: {team.TeamId}")
        logger.info(f"hitbox: {adjusted_hitbox}")

        logger.info(f"isInZRange: {isInZRange}")
        logger.info(f"isInYRange: {isInYRange}")
        logger.info(f"isOnLeftSide: {isOnLeftSide}")
        logger.info(f"isOnRightSide: {isOnRightSide}")

        if isOnLeftSide:
            return 4
        if isOnRightSide:
            return 5

        # Vérifier les collisions normales
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
        if not self.gameStarted:
            return
        # Collision avec les murs latéraux
        if self.ballPosition["x"] <= -self.FIELD_WIDTH / 2 or self.ballPosition["x"] >= self.FIELD_WIDTH / 2:
            self.ballDirection["x"] = -self.ballDirection["x"]
            if self.BALL_SPEED < self.BALL_MAX_SPEED:
                self.BALL_SPEED *= self.SPEED_INCREASE_FACTOR
            logger.info(f"Nouvelle vitesse de la balle: {self.BALL_SPEED}")

        # Collision avec les bateaux
        collision = await self.detectCollisionWithBoats()

        if collision <= 0:
            pass
        elif collision == 1:  # Collision centrale
            logger.info(f"collision: {collision}")
            self.ballDirection["y"] = -self.ballDirection["y"]
        elif collision == 2:  # Collision côté gauche
            logger.info(f"collision: {collision}")
            # Ajuster l'angle en fonction de la direction d'origine
            if abs(self.ballDirection["x"]) < 0.2:  # Si la balle arrive presque verticalement
                self.ballDirection["x"] = -0.5  # Force un angle vers la gauche
            else:
                self.ballDirection["x"] = -abs(self.ballDirection["x"]) * 1.2  # Accentue l'angle vers la gauche
            self.ballDirection["y"] = -self.ballDirection["y"]
            
            # Normaliser le vecteur de direction
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length
            
        elif collision == 3:  # Collision côté droit
            logger.info(f"collision: {collision}")
            # Ajuster l'angle en fonction de la direction d'origine
            if abs(self.ballDirection["x"]) < 0.2:  # Si la balle arrive presque verticalement
                self.ballDirection["x"] = 0.5  # Force un angle vers la droite
            else:
                self.ballDirection["x"] = abs(self.ballDirection["x"]) * 1.2  # Accentue l'angle vers la droite
            self.ballDirection["y"] = -self.ballDirection["y"]
            
            # Normaliser le vecteur de direction
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length

        elif collision == 4:  # Collision sur le bord droit
            logger.info(f"collision: {collision}")
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            # Déplacer la balle légèrement à l'extérieur de la hitbox
            logger.info(f"ballPosition: {self.ballPosition}")
            self.ballPosition["x"] = hitbox["max"]["x"] + 1.5
            logger.info(f"ballPosition: {self.ballPosition}")
            if (self.ballDirection["y"] == 0):
                self.ballDirection["y"] = -self.ballDirection["y"]
            else:
                if (self.ballPosition["y"] > 0):
                    self.ballDirection["y"] = -(self.ballDirection["y"] + 0.5)
                elif (self.ballPosition["y"] < 0):
                    self.ballDirection["y"] = -(self.ballDirection["y"] - 0.5)
            
            # Normaliser le vecteur avec une vitesse minimale
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            if length < 0.1:
                length = 1.0
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length

        elif collision == 5:  # Collision sur le bord gauche
            logger.info(f"collision: {collision}")
            hitbox = self.getAdjustedHitbox(self.teams[1 if self.ballPosition["y"] > 0 else 2])
            # Déplacer la balle légèrement à l'extérieur de la hitbox
            logger.info(f"ballPosition: {self.ballPosition}")
            self.ballPosition["x"] = hitbox["min"]["x"] - 1.5
            logger.info(f"ballPosition: {self.ballPosition}")
            if (self.ballDirection["y"] == 0):
                self.ballDirection["y"] = -self.ballDirection["y"]
            else:
                if (self.ballPosition["y"] > 0):
                    self.ballDirection["y"] = -(self.ballDirection["y"] + 0.5)
                elif (self.ballPosition["y"] < 0):
                    self.ballDirection["y"] = -(self.ballDirection["y"] - 0.5)
            
            # Normaliser le vecteur avec une vitesse minimale
            length = math.sqrt(self.ballDirection["x"]**2 + self.ballDirection["y"]**2)
            if length < 0.1:
                length = 1.0
            self.ballDirection["x"] /= length
            self.ballDirection["y"] /= length

        # if collision <= 0:
        #     pass
        # elif collision == 1:
        #     self.ballDirection["y"] = -self.ballDirection["y"]
        # elif collision == 2:
        #     self.ballDirection["x"] = -self.ballDirection["x"]
        #     self.ballDirection["y"] = -self.ballDirection["y"]
            
        # Points marqués
        if self.ballPosition["y"] <= -self.FIELD_HEIGHT / 2:
            # self.gameStarted = False
            self.resetBall()
            self.teams[1].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore()
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)
            # self.gameStarted = True
            logger.info(f"Points marqués - Team 1: {self.teams[1].getScore()}, Team 2: {self.teams[2].getScore()}")
        elif self.ballPosition["y"] >= self.FIELD_HEIGHT / 2:
            # self.gameStarted = False
            self.resetBall()
            self.teams[2].addPoint()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore()
            }, room=gameCode)
            await self.checkWinner(sio, gameCode)
            # self.gameStarted = True
            logger.info(f"Points marqués - Team 1: {self.teams[1].getScore()}, Team 2: {self.teams[2].getScore()}")
            
    def resetBall(self):
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()

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

    def removePlayerReady(self):
        logger.info("removePlayerReady")
        self.playerReady -= 1

    def getPlayerReady(self):
        logger.info("getPlayerReady")
        return self.playerReady

    def setNbPlayerPerTeam(self, nbPlayerPerTeam):
        logger.info("setNbPlayerPerTeam")
        self.nbPlayerPerTeam = nbPlayerPerTeam

    def setTeam(self, Team):
        if len(self.teams) < 2:
            self.teams[Team.TeamId] = Team
        else:
            logger.info("This Game is already full...")
        logger.info(f"size: {len(self.teams)}")

    def getTeam(self, TeamID):
        return self.teams.get(TeamID)

    def getNbPlayerPerTeam(self):
        return self.nbPlayerPerTeam

    def removeTeam(self, Team):
        if Team.TeamId in self.teams:
            del self.teams[Team.TeamId]

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
        boat = team.getBoat()

        formerBoatPos = team.getFormerBoatPosition()
        
        # Calculer le déplacement du bateau
        dx = boat['x'] - formerBoatPos['x']
        
        # Obtenir la hitbox de base
        hitbox = team.getBoatHitbox()
        
        # Ajuster la hitbox en fonction de la position du bateau
        adjusted_hitbox = {
            'min': {
                'x': hitbox['min']['x'] + dx,
                'y': hitbox['min']['y'] + boat['y'],
                'z': hitbox['min']['z'] + boat['z']
            },
            'max': {
                'x': hitbox['max']['x'] + dx,
                'y': hitbox['max']['y'] + boat['y'],
                'z': hitbox['max']['z'] + boat['z']
            }
        }
        
        # Extraire le tableau de points de la trajectoire
        points_array = trajectory.get('geometries', [])[0].get('data', {}).get('attributes', {}).get('position', {}).get('array', [])
        logger.info(f"points_array: {points_array}")

        # Parcourir les points 3 par 3 car chaque point est composé de [x, y, z]
        for i in range(0, len(points_array), 3):
            x = points_array[i]      # x coordinate
            y = points_array[i+1]    # y coordinate
            z = points_array[i+2]    # z coordinate
            
            # Vérifier la collision avec la hitbox ajustée
            if (adjusted_hitbox['min']['x'] <= x <= adjusted_hitbox['max']['x'] and
                adjusted_hitbox['min']['y'] <= y <= adjusted_hitbox['max']['y'] and
                adjusted_hitbox['min']['z'] <= z <= adjusted_hitbox['max']['z']):
                logger.info(f"Collision détectée - Point: {x, y, z}")
                # Collision détectée
                return -1
        return 0

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

    async def sendGameData(self, sio, gameCode, sid):
        logger.info("sendGameData")
        # Convertir les objets Player en format attendu par le client
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
        for team in self.teams.values():
            for player in team.player.values():
                if (player.getOnline() and player.getIsInit()):
                    logger.info(f"player.getOnline(): {player.getOnline()}")
                    logger.info(f"Sending gameData to the reconnected player with sid : {sid}")
                    await sio.emit('gameData', teamsArray, room=sid)
                    # player.setIsInit(True)
                else:
                    logger.info(f'Sending gameData: {teamsArray}')
                    await sio.emit('gameData', teamsArray, room=gameCode)
                    player.setIsInit(True)

    async def updateBoatAndCannonPosition(self, teamId, boatX, boatY, boatZ, cannonX, cannonY, cannonZ):
        await self.updateBoatPosition(teamId, boatX, boatY, boatZ)
        await self.updateCannonPosition(teamId, cannonX, cannonY, cannonZ)

    async def checkWinner(self, sio, gameCode):
        if self.teams[1].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[1].name, room=gameCode)
            self.gameStarted = False
            await self.sendGameInfo(sio, gameCode)
        elif self.teams[2].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[2].name, room=gameCode)
            self.gameStarted = False
            await self.sendGameInfo(sio, gameCode)

    async def sendGameInfo(self, sio, gameCode):
        ROOT_CA = os.getenv("GAMESERVER_ROOT_CA")
        backendServer_name = os.getenv("HOST_IP")
        backendServer_port = os.getenv("BACKEND_PORT")
        payload = {"Test1": "coucou1 " + gameCode, "Test2": "coucou2 " + gameCode}
        request = requests.post("https://" + backendServer_name + ":" + backendServer_port + "/user-management/set-info-game/", verify=ROOT_CA, data=payload)
        logger.info(f"request: {request}")