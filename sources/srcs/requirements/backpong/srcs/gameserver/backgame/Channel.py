from .Game import Game

class Channel:
    def __init__(self, channelId, creator):
        self.channelId = channelId
        self.game = Game()
        self.creator = creator

    def getGame(self):
        return self.game

    def sendBroadcastGameInfo(self, event, data):
        for team in self.game.teams.values():
            for player in team.player.values():
                player.socket.emit(event, data)

    def sendPrivateTeamGameInfo(self, event, data, Team):
        for player in Team.player.values():
            player.socket.emit(event, data)

    def getCreator(self):
        return self.creator 