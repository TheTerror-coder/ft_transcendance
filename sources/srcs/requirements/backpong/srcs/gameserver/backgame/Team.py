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

class Team:
    def __init__(self, name, maxNbPlayer, TeamId):
        self.name = name
        self.maxNbPlayer = int(maxNbPlayer)
        self.TeamId = TeamId
        self.player = {}
        self.nbPlayer = 0
        self.isFull = False
        self.score = 0
        self.boat = {'x': 0, 'y': 0, 'z': 0}
        self.cannon = {'x': 0, 'y': 0, 'z': 0}
        self.formerBoatPosition = {'x': 0, 'y': 0, 'z': 0}
        self.hitbox = {
            'min': {'x': 0, 'y': 0, 'z': 0},
            'max': {'x': 0, 'y': 0, 'z': 0}
        }

    def setIsFull(self):
        self.isFull = self.nbPlayer >= self.maxNbPlayer
        return self.isFull

    def getIsFull(self):
        return self.isFull

    def setPlayer(self, player):
        self.player[player.id] = player
        self.nbPlayer += 1
        self.setIsFull()

    def setBoatPosition(self, x, y, z):
        # Calculer le déplacement
        dx = x - self.boat['x']
        dy = y - self.boat['y']
        dz = z - self.boat['z']
        self.formerBoatPosition = {'x': self.boat['x'], 'y': self.boat['y'], 'z': self.boat['z']}
        
        # Mettre à jour la position du bateau
        self.boat['x'] = x
        self.boat['y'] = y
        self.boat['z'] = z
        # Mettre à jour la hitbox avec le même déplacement
        if self.hitbox:
            self.hitbox['min']['x'] += dx
            self.hitbox['min']['y'] += dy
            self.hitbox['min']['z'] += dz
            self.hitbox['max']['x'] += dx
            self.hitbox['max']['y'] += dy
            self.hitbox['max']['z'] += dz
        
        # logger.info(f"Boat and hitbox updated for team {self.TeamId}: pos={self.boat}, hitbox={self.hitbox}")

    def setBoatHitbox(self, hitbox):
        self.hitbox = hitbox
        logger.info(f"Hitbox set to: {hitbox} for team {self.TeamId}")

    def getBoatHitbox(self):
        return self.hitbox
    
    def getFormerBoatPosition(self):
        return self.formerBoatPosition

    def addPoint(self):
        logger.info(f"Team {self.TeamId} scored a point")
        self.score += 1
        logger.info(f"Team {self.TeamId} score: {self.score}")
        

    def getScore(self):
        return self.score

    def setBoat(self, boat):
        self.boat = boat

    def setCannon(self, cannon):
        self.cannon = cannon

    def setCannonPosition(self, x, y, z):
        self.cannon['x'] = x
        self.cannon['y'] = y
        self.cannon['z'] = z

    def removePlayer(self, id):
        if id in self.player:
            del self.player[id]
            self.nbPlayer -= 1

    def getTeamId(self):
        return self.TeamId

    def getBoat(self):
        return self.boat

    def getCannon(self):
        return self.cannon

    def getNbPlayer(self):
        return self.nbPlayer

    def getAllPlayer(self):
        return self.player

    def getPlayerById(self, id):
        return self.player.get(id)

    def getPlayerByName(self, name):
        for player in self.player.values():
            if player.name == name:
                return player
        return None

    def getName(self):
        return self.name