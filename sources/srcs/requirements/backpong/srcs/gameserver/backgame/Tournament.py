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

        self.nodes = []
        self.root = None

    def getTournamentId(self):
        return self.tournamentId
    
    def getTournamentTeams(self, teamId):
        return self.tournamentTeams.get(teamId)
    
    def getTournamentTeamsList(self):
        return self.tournamentTeams

    def getTournamentGames(self, gameId):
        return self.tournamentGames.get(gameId)
    
    def addTournamentTeam(self, team, sid):
        team.setPlayer(Player(sid, 'Captain', team.getName(), team.getTeamId()))
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
                if node.left.team and node.right.team and not node.team:
                    return (node.left.team, node.right.team)
            left_result = find_next_match(node.left)
            if left_result:
                return left_result
            return find_next_match(node.right)
            
        return find_next_match(self.root)

    def updateTournamentTree(self, winner_team):
        for parent_index in range((len(self.nodes) - 1) // 2, -1, -1):
            parent_node = self.nodes[parent_index]
            if parent_node.left and parent_node.right:
                left_winner = (parent_node.left.team and 
                             parent_node.left.team.getTeamId() == winner_team.getTeamId())
                right_winner = (parent_node.right.team and 
                              parent_node.right.team.getTeamId() == winner_team.getTeamId())

                if left_winner:
                    parent_node.team = parent_node.left.team
                elif right_winner:
                    parent_node.team = parent_node.right.team

    def getTournamentTreeData(self):
        def convert_node_to_dict(node):
            if not node:
                return None
            return {
                'team': node.team.getName() if node.team else None,
                'teamId': node.team.getTeamId() if node.team else None,
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