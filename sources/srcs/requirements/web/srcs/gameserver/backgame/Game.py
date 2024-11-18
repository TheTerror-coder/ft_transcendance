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
        # self.ballPosition = {'x': 0, 'y': 0, 'z': 0}
        # self.ballDirection = {'x': 0, 'y': 0, 'z': 0}
        self.gameInterval = None
        self.tickRate = 1000 / 60
        self.gameStarted = False
        self.teams = {}
        self.nbPlayerPerTeam = 0
        self.nbPlayerConnected = 0
        self.isPaused = False
        
        # Constantes pour la balle
        self.BALL_SPEED = 0.2
        self.SPEED_INCREASE_FACTOR = 1.1
        self.BALL_UPDATE_INTERVAL = 50
        self.FIELD_WIDTH = 60
        self.FIELD_HEIGHT = 60
        
        # État de la balle
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()

    def initializeBallPosition(self):
        return {"x": 0, "y": 0, "z": 2}

    def initializeBallDirection(self):
        import random
        return {
            "x": random.random() * 2 - 1,
            "y": random.random() * 2 - 1,
            "z": 0
        }

    async def updateBallPosition(self):
        self.ballPosition["x"] += self.ballDirection["x"] * self.BALL_SPEED
        self.ballPosition["y"] += self.ballDirection["y"] * self.BALL_SPEED
        return self.ballPosition

    async def isColliding(self, team):
        ballRadius = 0.5
        hitbox = team.getBoatHitbox()
        boatPos = team.getBoat()
        
        if not hitbox or not boatPos:
            logger.debug("Hitbox ou position du bateau non disponible")
            return False
        # logger.info(f"hitbox: {hitbox} boatPos: {boatPos}")

        # Calculer le déplacement du bateau
        formerBoatPos = team.getFormerBoatPosition()
        dx = boatPos['x'] - formerBoatPos['x']
        dy = boatPos['y'] - formerBoatPos['y']
        dz = boatPos['z'] - formerBoatPos['z']
        # Ajuster la hitbox en fonction de la position du bateau
        adjusted_hitbox = {
            'min': {
                'x': hitbox['min']['x'] + dx,
                'y': hitbox['min']['y'] + dy,
                'z': hitbox['min']['z'] + dz
            },
            'max': {
                'x': hitbox['max']['x'] + dx,
                'y': hitbox['max']['y'] + dy,
                'z': hitbox['max']['z'] + dz
            }
        }
        
        logger.info(f"team: {team.TeamId}")
        # Vérifier la collision avec la hitbox ajustée
        isInXRange = adjusted_hitbox['min']['x'] - ballRadius <= self.ballPosition['x'] <= adjusted_hitbox['max']['x'] + ballRadius
        isInYRange = adjusted_hitbox['min']['y'] - ballRadius <= self.ballPosition['y'] <= adjusted_hitbox['max']['y'] + ballRadius
        # isInZRange = adjusted_hitbox['min']['z'] - ballRadius <= self.ballPosition['z'] <= adjusted_hitbox['max']['z'] + ballRadius
        logger.info(f"isInXRange: adjusted_hitbox min x: {adjusted_hitbox['min']['x']}, ballRadius: {ballRadius}, ballPosition x: {self.ballPosition['x']}, adjusted_hitbox max x: {adjusted_hitbox['max']['x']}")
        logger.info(f"isInYRange: adjusted_hitbox min y: {adjusted_hitbox['min']['y']}, ballRadius: {ballRadius}, ballPosition y: {self.ballPosition['y']}, adjusted_hitbox max y: {adjusted_hitbox['max']['y']}")
        logger.info(f"isInXRange: {isInXRange} isInYRange: {isInYRange}")
        
        if isInXRange and isInYRange:
            logger.info(f"Collision détectée - Ball: {self.ballPosition}, Boat: {boatPos}, Adjusted Hitbox: {adjusted_hitbox}")
            return True
            
        return False

    async def detectCollisionWithBoats(self):
        for key, team in self.teams.items():
            boat_pos = team.getBoat()
            if boat_pos['x'] == 0 and boat_pos['y'] == 0 and boat_pos['z'] == 0:
                continue
                
            if await self.isColliding(team):
                logger.info(f"Collision avec le bateau de l'équipe {key}")
                return True
        return False

    async def handleCollisions(self, sio, gameCode):
        # Collision avec les murs latéraux
        if self.ballPosition["x"] <= -self.FIELD_WIDTH / 2 or self.ballPosition["x"] >= self.FIELD_WIDTH / 2:
            self.ballDirection["x"] = -self.ballDirection["x"]
            self.BALL_SPEED *= self.SPEED_INCREASE_FACTOR
            logger.info(f"Nouvelle vitesse de la balle: {self.BALL_SPEED}")

        # Collision avec les bateaux
        if await self.detectCollisionWithBoats():
            self.ballDirection["y"] = -self.ballDirection["y"]
            logger.info(f"Collision avec les bateaux - Nouvelle direction de la balle: {self.ballDirection}")
            
        # Points marqués
        if self.ballPosition["y"] <= -self.FIELD_HEIGHT / 2:
            self.teams[1].addPoint()
            self.resetBall()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore()
            }, room=gameCode)
        elif self.ballPosition["y"] >= self.FIELD_HEIGHT / 2:
            self.teams[2].addPoint()
            self.resetBall()
            await sio.emit('scoreUpdate', {
                'team1': self.teams[1].getScore(),
                'team2': self.teams[2].getScore()
            }, room=gameCode)

    def resetBall(self):
        self.ballPosition = self.initializeBallPosition()
        self.ballDirection = self.initializeBallDirection()
        self.BALL_SPEED = 0.2  # Réinitialiser la vitesse

    def getBallPosition(self):
        return self.ballPosition

    def addNbPlayerConnected(self):
        logger.info("addNbPlayerConnected")
        self.nbPlayerConnected += 1

    def removeNbPlayerConnected(self):
        logger.info("removeNbPlayerConnected")
        self.nbPlayerConnected -= 1

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

    async def updateBoatPosition(self, teamId, x, y, z):
        # logger.info(f"updateBoatPosition x: {x} y: {y} z: {z} for team {teamId} in Game.py")
        team = self.getTeam(teamId)
        if team:
            boat = team.getBoat()
            if boat:
                team.setBoatPosition(x, y, z)
                # logger.info(f"Boat position set to: {boat} for team {teamId} in Game.py")
                # logger.info(f"Values in updateBoatPosition: x: {x} y: {y} z: {z}")
            else:
                logger.info(f"Boat not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")

    async def updateCannonPosition(self, teamId, x, y, z):
        # logger.info("updateCannonPosition")
        team = self.getTeam(teamId)
        if team:
            cannon = team.getCannon()
            if cannon:
                team.setCannonPosition(x, y, z)
                logger.info(f"cannon: {cannon}")
            else:
                logger.info(f"Cannon not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")

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
                    team.setBoatPosition(boat['x'], boat['y'], boat['z'])
                if cannon:
                    await self.updateCannonPosition(teamId, cannon['x'], cannon['y'], cannon['z'])
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