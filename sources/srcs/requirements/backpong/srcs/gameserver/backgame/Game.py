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
        self.BALL_SPEED = 0.8
        self.SPEED_INCREASE_FACTOR = 1.1
        self.BALL_UPDATE_INTERVAL = 50
        self.FIELD_WIDTH = 160
        self.FIELD_HEIGHT = 110

        self.WINNING_SCORE = 10

        # État de la balle
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()

    def initializeBallPosition(self):
        return {"x": 0, "y": 0, "z": 2}

    # def initializeBallDirection(self):
    #     import random
    #     import math
    #     random_direction_x = 0
    #     random_direction_y = 0
    #     while random_direction_x == 0 and random_direction_y == 0:
    #         random_direction_x = random.random() * 2 - 1
    #         random_direction_y = random.random() * 2 - 1

    #     length = math.sqrt(random_direction_x ** 2 + random_direction_y ** 2)
    #     random_direction_x /= length
    #     random_direction_y /= length

    #     return {
    #         "x": random_direction_x,
    #         "y": random_direction_y,
    #         "z": 2
    #     }

    def initializeBallDirection(self):
        import random
        import math
        
        # Génération de x entre -1 et 1
        random_direction_x = random.random() * 2 - 1
        
        # Génération de y entre 0.5 et 1 ou -1 et -0.5 pour assurer un mouvement vertical significatif
        random_direction_y = random.random() * 0.5 + 0.5  # Entre 0.5 et 1
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

    async def updateBallPosition(self):
        if self.gameStarted:
            self.ballPosition["x"] += self.ballDirection["x"] * self.BALL_SPEED
            self.ballPosition["y"] += self.ballDirection["y"] * self.BALL_SPEED
        return self.ballPosition

    async def isColliding(self, team):
        ballRadius = 0.5
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
        
        isInXRange = adjusted_hitbox['min']['x'] <= self.ballPosition['x'] <= adjusted_hitbox['max']['x']
        isInYRange = adjusted_hitbox['min']['y'] <= self.ballPosition['y'] <= adjusted_hitbox['max']['y']
        
        if isInXRange and isInYRange:
            # Vérifier si la balle touche les bords droit ou gauche du bateau ou les bords haut ou bas
            isOnLeftSide = self.ballPosition['x'] <= adjusted_hitbox['min']['x']
            isOnRightSide = self.ballPosition['x'] >= adjusted_hitbox['max']['x']
            # isOnTopSide = self.ballPosition['y'] >= adjusted_hitbox['max']['y']
            # isOnBottomSide = self.ballPosition['y'] <= adjusted_hitbox['min']['y']
            if isOnRightSide or isOnLeftSide:
                return 2
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
        return 0

    async def handleCollisions(self, sio, gameCode):
        if not self.gameStarted:
            return
        # Collision avec les murs latéraux
        if self.ballPosition["x"] <= -self.FIELD_WIDTH / 2 or self.ballPosition["x"] >= self.FIELD_WIDTH / 2:
            self.ballDirection["x"] = -self.ballDirection["x"]
            if self.BALL_SPEED < 1.5:
                self.BALL_SPEED *= self.SPEED_INCREASE_FACTOR
            logger.info(f"Nouvelle vitesse de la balle: {self.BALL_SPEED}")

        # Collision avec les bateaux
        collision = await self.detectCollisionWithBoats()
        if collision <= 0:
            pass
        elif collision == 1:
            self.ballDirection["y"] = -self.ballDirection["y"]
        elif collision == 2:
            self.ballDirection["x"] = -self.ballDirection["x"]
            self.ballDirection["y"] = -self.ballDirection["y"]
            
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

    async def sendGameData(self, sio, gameCode):
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
        
        logger.info(f'Sending gameData: {teamsArray}')
        await sio.emit('gameData', teamsArray, room=gameCode)

    async def updateBoatAndCannonPosition(self, teamId, boatX, boatY, boatZ, cannonX, cannonY, cannonZ):
        await self.updateBoatPosition(teamId, boatX, boatY, boatZ)
        await self.updateCannonPosition(teamId, cannonX, cannonY, cannonZ)

    async def checkWinner(self, sio, gameCode):
        if self.teams[1].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[1].name, room=gameCode)
            self.gameStarted = False
        elif self.teams[2].getScore() >= self.WINNING_SCORE:
            await sio.emit('winner', self.teams[2].name, room=gameCode)
            self.gameStarted = False