from .Player import Player

class Tournament:
    def __init__(self, tournamentId):
        self.tournamentId = tournamentId
        self.tournamentTeams = {}
        self.tournamentGames = {}

        self.nbTeam = 1

    def getTournamentId(self):
        return self.tournamentId
    
    def getTournamentTeams(self, teamId):
        return self.tournamentTeams.get(teamId)
    
    def getTournamentGames(self, gameId):
        return self.tournamentGames.get(gameId)
    
    def addTournamentTeam(self, team, sid):
        team.setPlayer(Player(sid, 'Captain', team.getTeamName(), team.getTeamId()))
        self.tournamentTeams[team.getTeamId()] = team
        self.nbTeam += 1

    def addTournamentGame(self, game):
        self.tournamentGames[game.getGameId()] = game
    
    def removeTournamentTeam(self, team):
        if team.getTeamId() in self.tournamentTeams:
            del self.tournamentTeams[team.getTeamId()]
            self.nbTeam -= 1
    
    def removeTournamentGame(self, game):
        if game.getGameId() in self.tournamentGames:
            del self.tournamentGames[game.getGameId()]

    def getNbTeam(self):
        return self.nbTeam
    
    # def addNbTeam(self):
    #     self.nbTeam += 1

    # def removeNbTeam(self):
    #     self.nbTeam -= 1