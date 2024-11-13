import logging
import sys

# Configuration du logging au début du fichier
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

class Game:
    def __init__(self):
        self.ballPosition = {'x': 0, 'y': 0, 'z': 0}
        self.ballDirection = {'x': 0, 'y': 0, 'z': 0}
        self.gameInterval = None
        self.tickRate = 1000 / 60
        self.gameStarted = False
        self.teams = {}
        self.nbPlayerPerTeam = 0
        self.nbPlayerConnected = 0
        self.isPaused = False

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
        logger.info(f"updateBoatPosition x: {x} y: {y} z: {z} for team {teamId} in Game.py")
        team = self.getTeam(teamId)
        if team:
            boat = team.getBoat()
            if boat:
                team.setBoatPosition(x, y, z)
                logger.info(f"Boat position set to: {boat} for team {teamId} in Game.py")
            else:
                logger.info(f"Boat not found for team {teamId}")
        else:
            logger.info(f"Team {teamId} not found")

    async def updateCannonPosition(self, teamId, x, y, z):
        logger.info("updateCannonPosition")
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

    def updateClientData(self, data):
        teamId = data.get('team')
        boat = data.get('boat', {})
        cannon = data.get('cannon', {})
        boatDimensions = data.get('boatDimensions', {})

        if teamId and boat:
            self.updateBoatPosition(teamId, boat['x'], boat['y'], boat['z'])
        if teamId and cannon:
            self.updateCannonPosition(teamId, cannon['x'], cannon['y'], cannon['z'])
        if teamId and boat and boatDimensions:
            self.updateBoatHitbox(teamId, boat, boatDimensions)

    def updateBoatHitbox(self, teamId, position, dimensions):
        team = self.getTeam(teamId)
        if team:
            team.setBoatHitbox(position, dimensions)
        else:
            logger.info(f"Team {teamId} not found")

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