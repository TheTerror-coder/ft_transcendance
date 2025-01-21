from .Game import Game
from .Tournament import Tournament
class Channel:
    def __init__(self, channelId, creator, isTournament):
        self.channelId = channelId
        self.creator = creator
        self.isTournament = isTournament
        self.tournament = None
        if (self.isTournament):
            self.tournament = Tournament(channelId)
        else:
            self.game = Game(channelId, False, None)

    def getGame(self):
        return self.game
    
    def getTournament(self):
        return self.tournament

    def sendBroadcastGameInfo(self, event, data):
        for team in self.game.teams.values():
            for player in team.player.values():
                player.socket.emit(event, data)

    def sendPrivateTeamGameInfo(self, event, data, Team):
        for player in Team.player.values():
            player.socket.emit(event, data)

    def getCreator(self):
        return self.creator
    
    def setTournament(self, tournament):
        self.tournament = tournament

    def getIsTournament(self):
        return self.isTournament