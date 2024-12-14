
class Players:
    def __init__(self, player_id=None, username=None, is_win=None):
        self.id = player_id if player_id else None
        self.username = username if username else None
        self.is_win = is_win if is_win else None


class GameNode:
    def __init__(self, user=None):
        self.user = user
        self.left = None
        self.right = None
        
        
class Tournament:
    def __init__(self):
        self.root = None
        self.players = []
        self.nodes = []

    def get_players(self):
        return self.players
    
    def get_players_pair(self):
        fight_list = []
        for i in range(0, len(self.players), 2):
            if i + 1 < len(self.players):
                fight_list.append((self.players[i], self.players[i + 1]))
        return fight_list
    
    def create_tree(self, num_players):
        total_nodes = 2 * num_players - 1
        for _ in range(total_nodes):
            self.nodes.append(GameNode())

        for i in range(total_nodes // 2):
            self.nodes[i].left = self.nodes[2 * i + 1]
            self.nodes[i].right = self.nodes[2 * i + 2]
        self.root = self.nodes[0]

    def assign_players(self, players):
        leaves = [node for node in self.nodes if not node.left and not node.right]
        if len(players) != len(leaves):
            raise ValueError("Le nombre de joueurs doit correspondre au nombre de feuilles.")

        for leaf, player in zip(leaves, players):
            leaf.user = player
        
        self.players = players

    def update_tree(self, players):
        for parent_index in range((len(self.nodes) - 1) // 2, -1, -1):
            parent_node = self.nodes[parent_index]
            if parent_node.left and parent_node.right:
                left_winner = parent_node.left.user and parent_node.left.user.username in [player.username for player in players]
                right_winner = parent_node.right.user and parent_node.right.user.username in [player.username for player in players]

                if left_winner:
                    parent_node.user = parent_node.left.user
                elif right_winner:
                    parent_node.user = parent_node.right.user

                if parent_node.left and not left_winner:
                    self.nodes.remove(parent_node.left)
                    self.nodes.remove(parent_node.right)
                    parent_node.left = None
                    parent_node.right = None
                if parent_node.right and not right_winner:
                    self.nodes.remove(parent_node.left)
                    self.nodes.remove(parent_node.right)
                    parent_node.left = None
                    parent_node.right = None
        self.players = [node.user for node in self.nodes if not node.left and not node.right]



    def print_tournament(self, node, level=0, prefix=""):
        if node is not None:
            display_name = node.user.username if node.user and node.user.username else "Empty"
            print(" " * (level * 4) + prefix + display_name)
            
            if node.left or node.right:
                self.print_tournament(node.left, level + 1, "/ ")
                self.print_tournament(node.right, level + 1, " \\ ")


# def game_routing(request):
#     global GLOBAL_TOURNAMENT
#     status = request.data.get('status')
#     player = Players(request.user.id, request.user.username, request.user.is_win)

#     if GLOBAL_TOURNAMENT['status'] == "WAITING":
#         if player not in GLOBAL_TOURNAMENT['players']:
#             GLOBAL_TOURNAMENT['players'].append(player)            
#         if len(GLOBAL_TOURNAMENT['players']) == request.user.people:
#             GLOBAL_TOURNAMENT['status'] = "START_GAME"
#     if status == 'START_GAME' and GLOBAL_TOURNAMENT['status'] == "START_GAME":
#         if GLOBAL_TOURNAMENT['game'] is None:
#             players = GLOBAL_TOURNAMENT['players']
#             random.shuffle(players)
#             for idx, player in enumerate(players, start=1):
#                 player.id = idx
#             game = Tournament()
#             game.create_tree(len(players))
#             game.assign_players(players)
#             GLOBAL_TOURNAMENT['game'] = game
#             GLOBAL_TOURNAMENT['status'] = "IN_GAME"
#             game.print_tournament(game.root)
#         return {'status': GLOBAL_TOURNAMENT['status'], 'players': [(p.username, p.id) for p in players]}
#     elif status == 'IN_GAME' and GLOBAL_TOURNAMENT['status'] == "IN_GAME":
#         game = GLOBAL_TOURNAMENT['game']
        

#         # if player.is_win == True:
#         #     # actualiser la cote et les stats
#         #     pairs = game.get_players_pair()
#         #     winners = [pair[0] if pair[0].username == player.username else pair[1] for pair in enumerate(pairs)]
#         # else:
#         #     #actualiser la cote et les stats du looser
         
#         pairs = game.get_players_pair()
#         winners = [pair[0] if i % 2 == 0 else pair[1] for i, pair in enumerate(pairs)]
        
#         game.update_tree(winners)
#         game.print_tournament(game.root)
#         GLOBAL_TOURNAMENT['players'] = game.players
#         print("len p: ", len(game.players))
#         if len(game.players) == 1:
#             GLOBAL_TOURNAMENT['status'] = "END_GAME"
#         return {'status': GLOBAL_TOURNAMENT['status'], 'players': [(p.username, p.id) for p in game.players]}
#     elif GLOBAL_TOURNAMENT['status'] == "END_GAME":
#         return {'status': 'END_GAME', 'message': 'The game has ended'}
#     return {'status': GLOBAL_TOURNAMENT['status'], 'message': 'Unexpected status'}


# class MockRequest:
#     def __init__(self, data):
#         self.data = data
#         self.user = type('User', (), {
#             'username': data['username'],
#             'id': data['id'],
#             'people': data['people'],
#             'is_win': False,
#         })


# def generate_users():
#     return [MockRequest({'status': "WAITING", 'people': 8, 'username': f'user{i}', 'id': None}) for i in range(1, 9)]


# def main():
#     users = generate_users()
#     for user in users:
#         response = game_routing(user)
#     while response['status'] != 'END_GAME':
#         for user in users:
#             user.data['status'] = response['status']
#             response = game_routing(user)
#             print(response)
#             sleep(1)
#             if response['status'] == 'END_GAME':
#                 break


# if __name__ == "__main__":
#     main()
