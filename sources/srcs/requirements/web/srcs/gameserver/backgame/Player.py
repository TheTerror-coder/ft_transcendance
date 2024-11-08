class Player:
    def __init__(self, id, role, name, TeamID):
        self.socket = None
        self.id = id
        self.role = role
        self.name = name
        self.cameraPos = None
        self.TeamID = TeamID

    def getId(self):
        return self.id

    def getRole(self):
        return self.role

    def getName(self):
        return self.name

    def getCameraPos(self):
        return self.cameraPos

    def getTeamID(self):
        return self.TeamID

    def setTeamID(self, TeamID):
        self.TeamID = TeamID

    def setCameraPos(self):
        p = 0
        if self.TeamID == 0:
            p = 1
        elif self.TeamID == 1:
            p = -1
        
        if self.role == 'Captain':
            self.cameraPos = {'x': 0, 'y': 0, 'z': 20 * p}
        elif self.role == 'Cannoneer':
            self.cameraPos = {'x': 0, 'y': 0, 'z': 20 * p}

    def setSocket(self, socket):
        self.socket = socket 