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
        self.tournamentGameNumber = 0
        self.isFull = False

        self.nodes = []
        self.root = None
        self.returned_matches = set()

    def getIsFull(self):
        return self.isFull
    
    def setIsFull(self, isFull):
        self.isFull = isFull

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
            self.resetGameState(game)
            game.gameStarted = False
            game.setGameInLobby(False)
            game.setIsLaunch(False)
            del self.tournamentGames[game.getGameId()]
            logger.info(f"Game {game.getGameId()} removed from tournament")

    def resetGameState(self, game):
        if not game:
            return
        
        for teamId in [1, 2]:
            team = game.getTeam(teamId)
            if team:
                game.removeTeam(team)
        
        game.nbPlayerConnected = 0
        game.playerReady = 0
        
        game.resetGameState()

    def getNbTeam(self):
        return self.nbTeam

    def shuffleTeams(self):
        import random
        
        teams_list = list(self.tournamentTeams.values())
        random.shuffle(teams_list)
        
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
                    
                    if match_id not in self.returned_matches:
                        self.returned_matches.add(match_id)
                        return (node.left.team, node.right.team)
            
            left_result = find_next_match(node.left)
            if left_result:
                return left_result
            return find_next_match(node.right)

        if len(self.returned_matches) == len(self.tournamentTeams) - 1:
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
            
            if node.left and node.right and node.left.team and node.right.team:
                if ((node.left.team.getTournamentTeamId() == winner_team.getTournamentTeamId() or 
                    node.right.team.getTournamentTeamId() == winner_team.getTournamentTeamId()) and
                    not node.team):
                    node.team = winner_team
                    logger.info(f"Updated winner {winner_team.getName()} at level {node}")
                    return True
                    
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

    def getTournamentMatches(self):
        matches = []
        
        def traverse_tree(node, level=0):
            if not node:
                return
            
            if node.left and node.right:
                left_team = node.left.team
                right_team = node.right.team
                
                if left_team and right_team:
                    match_info = {
                        'level': level,
                        'status': 'pending',
                        'team1': {
                            'name': left_team.getName(),
                            'id': left_team.getTournamentTeamId()
                        },
                        'team2': {
                            'name': right_team.getName(),
                            'id': right_team.getTournamentTeamId()
                        }
                    }
                    
                    game_code = self.findGameByTeams(left_team.getTournamentTeamId(), 
                                                   right_team.getTournamentTeamId())
                    
                    if game_code:
                        game = self.getTournamentGames(game_code)
                        if game:
                            match_info.update({
                                'gameCode': game_code,
                                'team1': {
                                    'name': left_team.getName(),
                                    'id': left_team.getTournamentTeamId(),
                                    'score': game.getTeam(1).getScore()
                                },
                                'team2': {
                                    'name': right_team.getName(),
                                    'id': right_team.getTournamentTeamId(),
                                    'score': game.getTeam(2).getScore()
                                },
                                'status': 'in_progress' if game.gameStarted else 'completed',
                                'winner': node.team.getName() if node.team else None
                            })
                    
                    matches.append(match_info)
                
                elif left_team or right_team:
                    matches.append({
                        'level': level,
                        'status': 'waiting',
                        'team1': {
                            'name': left_team.getName() if left_team else "À déterminer",
                            'id': left_team.getTournamentTeamId() if left_team else None
                        },
                        'team2': {
                            'name': right_team.getName() if right_team else "À déterminer",
                            'id': right_team.getTournamentTeamId() if right_team else None
                        }
                    })
            
            if node.left:
                traverse_tree(node.left, level + 1)
            if node.right:
                traverse_tree(node.right, level + 1)
        
        traverse_tree(self.root)
        return matches

    def findGameByTeams(self, team1_id, team2_id):
        for game_code, game in self.tournamentGames.items():
            teams = list(game.teams.values())
            if len(teams) == 2:
                game_team1_id = teams[0].getTournamentTeamId()
                game_team2_id = teams[1].getTournamentTeamId()
                if (game_team1_id == team1_id and game_team2_id == team2_id) or \
                   (game_team1_id == team2_id and game_team2_id == team1_id):
                    return game_code
        return None

    def findMatchByPlayerId(self, player_id):
        def check_match(node):
            if not node or not node.left or not node.right:
                return None
            
            left_team = node.left.team
            right_team = node.right.team
            
            if left_team and right_team:
                if (left_team.getTournamentTeamId() == player_id or 
                    right_team.getTournamentTeamId() == player_id):
                    return (left_team, right_team)
            
            left_result = check_match(node.left)
            if left_result:
                return left_result
            return check_match(node.right)
        
        return check_match(self.root)