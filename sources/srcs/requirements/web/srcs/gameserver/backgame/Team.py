class Team:
    def __init__(self, name, nbPlayer, TeamId):
        self.TeamId = TeamId
        self.name = name
        self.nbPlayer = 0
        self.maxNbPlayer = nbPlayer
        self.player = {}
        self.boat = {'x': 0, 'y': 0, 'z': 0}
        self.cannon = {'x': 0, 'y': 0, 'z': 0}
        self.isFull = False
        self.score = 0
        self.hitbox = None

    def setBoatHitbox(self, position, dimensions):
        self.hitbox = {
            'min': {
                'x': position['x'] - dimensions['width']/2,
                'y': position['y'] - dimensions['height']/2,
                'z': position['z'] - dimensions['depth']/2
            },
            'max': {
                'x': position['x'] + dimensions['width']/2,
                'y': position['y'] + dimensions['height']/2,
                'z': position['z'] + dimensions['depth']/2
            }
        }

    def getBoatHitbox(self):
        return self.hitbox

    def addPoint(self):
        self.score += 1

    def getScore(self):
        return self.score

    def setIsFull(self):
        self.isFull = self.nbPlayer >= self.maxNbPlayer

    def getIsFull(self):
        return self.isFull

    def setPlayer(self, player):
        if self.getIsFull():
            print("This Team is already full...")
            return
        self.player[player.id] = player
        self.nbPlayer += 1
        self.setIsFull()

    def setTeamName(self, name):
        self.name = name

    def setBoat(self, boat):
        self.boat = boat

    def setBoatPosition(self, x, y, z):
        self.boat['x'] = x
        self.boat['y'] = y
        self.boat['z'] = z
        print(f"Boat position set to: {self.boat} for team {self.TeamId} in Team.py")

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
        if not self.boat:
            print(f"Boat not initialized for team {self.TeamId}")
            return None
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