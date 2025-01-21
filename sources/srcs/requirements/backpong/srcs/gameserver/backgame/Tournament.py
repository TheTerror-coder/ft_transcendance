from .Player import Player
import logging
import sys

logging.basicConfig(
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    # stream=sys.stderr
)
logger = logging.getLogger(__name__)

class GameNode:
    def __init__(self, team=None):
        self.team = team
        self.left = None
        self.right = None

class Tournament:
    def __init__(self, tournamentId):
        self.tournamentId = tournamentId
        self.tournamentTeams = {}
        self.tournamentGames = {}
        self.nbTeam = 0
        self.start = False

        self.nodes = []
        self.root = None
        self.returned_matches = set()

    def getStart(self):
        return self.start
    
    def setStart(self, start):
        self.start = start

    def getTournamentId(self):
        return self.tournamentId
    
    def getTournamentTeams(self, teamId):
        return self.tournamentTeams.get(teamId)
    
    def getTournamentTeamsList(self):
        return self.tournamentTeams

    def getTournamentGames(self, gameId):
        return self.tournamentGames.get(gameId)
    
    def getTournamentGamesList(self):
        return self.tournamentGames
    
    def addTournamentTeam(self, team, sid):
        team.setPlayer(Player(sid, 'captain', team.getName(), team.getTournamentTeamId()))
        self.tournamentTeams[team.getTournamentTeamId()] = team
        self.nbTeam += 1

    def addTournamentGame(self, game):
        self.tournamentGames[game.getGameId()] = game
    
    def removeTournamentTeam(self, team):
        if team.getTournamentTeamId() in self.tournamentTeams:
            del self.tournamentTeams[team.getTournamentTeamId()]
            self.nbTeam -= 1
    
    def removeTournamentGame(self, game):
        if game and game.getGameId() in self.tournamentGames:
            # Nettoyer explicitement les équipes
            for teamId in list(game.teams.keys()):
                team = game.teams[teamId]
                # Nettoyer les joueurs
                for playerId in list(team.player.keys()):
                    team.removePlayer(playerId)
                # Supprimer l'équipe
                game.removeTeam(team)
            
            # Réinitialiser l'état du jeu
            game.resetGameState()
            # Supprimer la partie du dictionnaire
            del self.tournamentGames[game.getGameId()]
            
            logger.info(f"Game {game.getGameId()} completely cleaned up and removed from tournament")

    def resetGameState(self, game):
        if not game:
            return
        
        # Nettoyer les équipes
        for teamId in [1, 2]:
            team = game.getTeam(teamId)
            if team:
                for player in list(team.player.values()):
                    team.removePlayer(player.getId())
                game.removeTeam(team)
        
        # Réinitialiser les compteurs
        game.nbPlayerConnected = 0
        game.playerReady = 0
        
        # Réinitialiser l'état du jeu
        game.resetGameState()

    def getNbTeam(self):
        return self.nbTeam

    def shuffleTeams(self):
        import random
        
        teams_list = list(self.tournamentTeams.values())
        logger.info(f"Teams before shuffle: {[team.getName() for team in teams_list]}")
        random.shuffle(teams_list)
        logger.info(f"Teams after shuffle: {[team.getName() for team in teams_list]}")
        
        matches = []
        for i in range(0, len(teams_list), 2):
            if i + 1 < len(teams_list):
                matches.append((teams_list[i], teams_list[i + 1]))
        logger.info(f"Created matches: {[(m[0].getName(), m[1].getName()) for m in matches]}")
        
        return matches

    def createTournamentTree(self):
        num_teams = len(self.tournamentTeams)
        total_nodes = 2 * num_teams - 1
        logger.info(f"Creating tree with {num_teams} teams, total nodes: {total_nodes}")
        
        self.nodes = []
        for _ in range(total_nodes):
            self.nodes.append(GameNode())
        
        for i in range(total_nodes // 2):
            self.nodes[i].left = self.nodes[2 * i + 1]
            self.nodes[i].right = self.nodes[2 * i + 2]
        
        self.root = self.nodes[0]
        matches = self.shuffleTeams()
        
        if matches:
            leaves = [node for node in self.nodes if not node.left and not node.right]
            logger.info(f"Number of leaf nodes: {len(leaves)}")
            for i, match in enumerate(matches):
                if 2*i < len(leaves):
                    leaves[2*i].team = match[0]
                    leaves[2*i+1].team = match[1]
                    logger.info(f"Assigned match {i}: {match[0].getName()} vs {match[1].getName()}")
        
        self.print_tournament_tree()

    def getNextMatch(self):
        if not self.root:
            return None
            
        def find_next_match(node):
            if not node:
                return None
            
            if node.left and node.right:
                if not node.team and node.left.team and node.right.team:
                    match_id = f"{node.left.team.getName()}_{node.right.team.getName()}"
                    
                    # Log pour debug
                    logger.info(f"Checking match: {match_id}")
                    logger.info(f"Node state: parent={node.team}, left={node.left.team.getName()}, right={node.right.team.getName()}")
                    
                    if match_id not in self.returned_matches:
                        self.returned_matches.add(match_id)
                        logger.info(f"Found next match: {node.left.team.getName()} vs {node.right.team.getName()}")
                        return (node.left.team, node.right.team)
            
            left_result = find_next_match(node.left)
            if left_result:
                return left_result
            return find_next_match(node.right)

        if len(self.returned_matches) == len(self.tournamentTeams) - 1:
            logger.info("Resetting returned_matches for next round")
            self.returned_matches.clear()
        
        result = find_next_match(self.root)
        if result:
            logger.info(f"Returning match: {result[0].getName()} vs {result[1].getName()}")
        else:
            logger.info("No next match found")
        
        return result

    def updateTournamentTree(self, winner_team):
        def find_and_update(node):
            if not node:
                return False
            
            # Si c'est un match en cours (les deux enfants ont des équipes)
            if node.left and node.right and node.left.team and node.right.team:
                # Vérifie si ce match contient le gagnant
                if ((node.left.team.getTournamentTeamId() == winner_team.getTournamentTeamId() or 
                    node.right.team.getTournamentTeamId() == winner_team.getTournamentTeamId()) and
                    not node.team):  # Vérifie que le nœud n'a pas déjà un gagnant
                    node.team = winner_team
                    logger.info(f"Updated winner {winner_team.getName()} at level {node}")
                    return True
                    
            # Recherche récursive
            if find_and_update(node.left):
                return True
            return find_and_update(node.right)
            
        find_and_update(self.root)
        self.print_tournament_tree()
        
    def getTournamentTreeData(self):
        def convert_node_to_dict(node):
            if not node:
                return None
            return {
                'team': node.team.getName() if node.team else None,
                'teamId': node.team.getTournamentTeamId() if node.team else None,
                'left': convert_node_to_dict(node.left),
                'right': convert_node_to_dict(node.right)
            }
        
        return convert_node_to_dict(self.root)
    
    def print_tournament_tree(self):
        def print_node(node, level=0, prefix=""):
            if node is not None:
                display_name = node.team.getName() if node.team else "Empty"
                logger.info(" " * (level * 4) + prefix + display_name)
                
                if node.left or node.right:
                    print_node(node.left, level + 1, "├── ")
                    print_node(node.right, level + 1, "└── ")
        
        logger.info("Tournament Tree:")
        print_node(self.root)