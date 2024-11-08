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
        print("addNbPlayerConnected")
        self.nbPlayerConnected += 1

    def removeNbPlayerConnected(self):
        print("removeNbPlayerConnected")
        self.nbPlayerConnected -= 1

    def setNbPlayerPerTeam(self, nbPlayerPerTeam):
        self.nbPlayerPerTeam = nbPlayerPerTeam

    def setTeam(self, Team):
        if len(self.teams) < 2:
            self.teams[Team.TeamId] = Team
        else:
            print("This Game is already full...")
        print(f"size: {len(self.teams)}")

    def getTeam(self, TeamID):
        return self.teams.get(TeamID)

    def getNbPlayerPerTeam(self):
        return self.nbPlayerPerTeam

    def removeTeam(self, Team):
        if Team.TeamId in self.teams:
            del self.teams[Team.TeamId]

    async def updateBoatPosition(self, teamId, x, y, z):
        print(f"updateBoatPosition x: {x} y: {y} z: {z} for team {teamId} in Game.py")
        team = self.getTeam(teamId)
        if team:
            boat = team.getBoat()
            if boat:
                team.setBoatPosition(x, y, z)
                print(f"Boat position set to: {boat} for team {teamId} in Game.py")
            else:
                print(f"Boat not found for team {teamId}")
        else:
            print(f"Team {teamId} not found")

    async def updateCannonPosition(self, teamId, x, y, z):
        print("updateCannonPosition")
        team = self.getTeam(teamId)
        if team:
            cannon = team.getCannon()
            if cannon:
                team.setCannonPosition(x, y, z)
                print(f"cannon: {cannon}")
            else:
                print(f"Cannon not found for team {teamId}")
        else:
            print(f"Team {teamId} not found")

    def updateClientData(self, team):
        self.updateBoatPosition(team.TeamID, team.boat['x'], team.boat['y'], team.boat['z'])
        self.updateCannonPosition(team.TeamID, team.cannon['x'], team.cannon['y'], team.cannon['z'])
        self.updateBoatHitbox(team.TeamID, team.boat, team.boatDimensions)

    def updateBoatHitbox(self, teamId, position, dimensions):
        team = self.getTeam(teamId)
        if team:
            team.setBoatHitbox(position, dimensions)
        else:
            print(f"Team {teamId} not found")

    def sendGameData(self, io, gameCode):
        print("sendGameData")
        teamsArray = {
            'team1': {
                'TeamId': self.getTeam(1).TeamId,
                'Name': self.getTeam(1).name,
                'MaxNbPlayer': self.getTeam(1).maxNbPlayer,
                'NbPlayer': self.getTeam(1).nbPlayer,
                'Boat': self.getTeam(1).boat,
                'Cannon': self.getTeam(1).cannon,
                'Player': {k: v for k, v in self.getTeam(1).player.items()},
                'IsFull': self.getTeam(1).isFull,
            },
            'team2': {
                'TeamId': self.getTeam(2).TeamId,
                'Name': self.getTeam(2).name,
                'MaxNbPlayer': self.getTeam(2).maxNbPlayer,
                'NbPlayer': self.getTeam(2).nbPlayer,
                'Boat': self.getTeam(2).boat,
                'Cannon': self.getTeam(2).cannon,
                'Player': {k: v for k, v in self.getTeam(2).player.items()},
                'IsFull': self.getTeam(2).isFull,
            }
        }
        print('teamsArray : ', teamsArray)
        io.emit('gameData', teamsArray, room=gameCode)

    async def updateBoatAndCannonPosition(self, teamId, boatX, boatY, boatZ, cannonX, cannonY, cannonZ):
        await self.updateBoatPosition(teamId, boatX, boatY, boatZ)
        await self.updateCannonPosition(teamId, cannonX, cannonY, cannonZ)