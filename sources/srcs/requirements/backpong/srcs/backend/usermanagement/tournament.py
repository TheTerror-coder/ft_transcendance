# # from rest_framework.decorators import api_view
# # from rest_framework.response import Response
# # from django.contrib.auth.decorators import login_required
# # from django.views.decorators.csrf import csrf_protect
# import random
# from time import sleep

# GLOBAL_TOURNAMENT = {
#     "game": None,
#     "people": None,
#     "players": [],
#     "status": "WAITING",  # WAITING -> STARTGAME -> IN_GAME -> END_GAME
#     "fight_list": [],
# }

# class Players:
#     def __init__(self, player_id=None, username=None):
#         self.id = player_id if player_id else None
#         self.username = username if username else None


# class GameNode:
#     def __init__(self, player=None):
#         self.id = player.id if player else None
#         self.username = player.username if player else None
#         self.left = None
#         self.right = None


# class Tournament:
#     def __init__(self):
#         self.root = None
#         self.players = []
#         self.nodes = []

#     def get_players(self):
#         return self.players
    
#     def get_players_pair(self):
#         fight_list = []
#         for i in range(0, len(self.players), 2):
#             if i + 1 < len(self.players):
#                 fight_list.append((self.players[i], self.players[i + 1]))
#         return fight_list
    
#     def get_parent_node(self, node_index):
#         if node_index == 0:
#             return self.nodes[0]
#         parent_index = (node_index - 1) // 2
#         return self.nodes[parent_index]

#     def create_tree(self, num_players):
#         total_nodes = 2 * num_players - 1
#         for _ in range(total_nodes):
#             self.nodes.append(GameNode())

#         for i in range(total_nodes // 2):
#             self.nodes[i].left = self.nodes[2 * i + 1]
#             self.nodes[i].right = self.nodes[2 * i + 2]

#         self.root = self.nodes[0]

#     def assign_players(self, players):
#         leaves = [node for node in self.nodes if not node.left and not node.right]
#         if len(players) != len(leaves):
#             raise ValueError("Le nombre de joueurs doit correspondre au nombre de feuilles.")

#         for leaf, player in zip(leaves, players):
#             leaf.id = player.id
#             leaf.username = player.username
        
#         self.players = leaves
#         # for p in self.players:
#         #     print(f"self.player de start game {p.username} id {p.id}")


#     def upload_tree(self, players):
#         # Parcourir les nœuds de bas en haut
#         for parent_index in range((len(self.nodes) - 1) // 2, -1, -1):
#             parent_node = self.nodes[parent_index]
#             if parent_node.left and parent_node.right:
#                 # Vérifier si le joueur gagnant est dans la liste des joueurs
#                 left_winner = parent_node.left.username in [player.username for player in players]
#                 right_winner = parent_node.right.username in [player.username for player in players]

#                 if left_winner:
#                     parent_node.username = parent_node.left.username
#                     parent_node.id = parent_node.left.id
#                 elif right_winner:
#                     parent_node.username = parent_node.right.username
#                     parent_node.id = parent_node.left.id
                    
#                 # Supprimer les feuilles inutiles
#                 if parent_node.left and not left_winner:
#                     self.nodes.remove(parent_node.left)
#                     self.nodes.remove(parent_node.right)
#                     parent_node.left = None
#                     parent_node.right = None
#                 if parent_node.right and not right_winner:
#                     self.nodes.remove(parent_node.left)
#                     self.nodes.remove(parent_node.right)
#                     parent_node.left = None
#                     parent_node.right = None
        
#         self.players = [node for node in self.nodes if not node.left and not node.right]
#         # for p in self.players:
#         #     print(f"self.player de update: {p.username} id {p.id}")
        

#     def print_tournament(self, node, level=0, prefix=""):
#         if node is not None:
#             display_name = node.username if node.username else "Empty"
#             # display_id = node.id if node.id else None
#             print(" " * (level * 4) + prefix + display_name) # + " " + str(display_id)
#             if node.left or node.right:
#                 self.print_tournament(node.left, level + 1, "/ ")
#                 self.print_tournament(node.right, level + 1, " \\ ")



# # @api_view(['GET', 'POST'])
# # @login_required
# # @csrf_protect
# def game_routing(request):
#     # print(f"request: {request.data['username']} id: {request.data['id']}")
#     global GLOBAL_TOURNAMENT
#     username = request.user.username
#     status = request.data.get('status')
#     player_data = {"id": request.user.id, "username": username}

#     if GLOBAL_TOURNAMENT['status'] == "WAITING":
#         GLOBAL_TOURNAMENT['people'] = request.user.people
#         if player_data not in GLOBAL_TOURNAMENT['players']:
#             GLOBAL_TOURNAMENT['players'].append(player_data)
#         if len(GLOBAL_TOURNAMENT['players']) == GLOBAL_TOURNAMENT['people']:
#             GLOBAL_TOURNAMENT['status'] = "START_GAME"

#     # print("status: ", request.data['status'])
#     if status == 'START_GAME' and GLOBAL_TOURNAMENT['status'] == "START_GAME":
#         if GLOBAL_TOURNAMENT['game'] is None:
#             players = GLOBAL_TOURNAMENT['players']
#             random.shuffle(players)
#             for idx, player in enumerate(players, start=1):
#                 player['id'] = idx
#             game = Tournament()
#             game.create_tree(len(players))
#             game.assign_players([Players(p["id"], p["username"]) for p in players])
#             GLOBAL_TOURNAMENT['fight_list'] = game.get_players_pair()
#             GLOBAL_TOURNAMENT['game'] = game
#             GLOBAL_TOURNAMENT['status'] = "IN_GAME"
#             game.print_tournament(game.root)
#             # print("len: ", len(GLOBAL_TOURNAMENT['players']))
#         return ({
#             'status': GLOBAL_TOURNAMENT['status'],
#             'players': [(p["username"], p["id"]) for p in players]
#         })

#     elif status == 'IN_GAME' and GLOBAL_TOURNAMENT['status'] == "IN_GAME":
#         # print("caca", players)
#         #if request.user.is_win === 'True':
#             #actualiser les stat pour enregistrer dans la db
        
#         game = GLOBAL_TOURNAMENT['game']
#         #metre a jour GLOBAL_TOURNAMENT['players'] en fonction du resultat
#         for p in GLOBAL_TOURNAMENT['fight_list']:
#             print("players_data: ", p[0].username, p[1].username)
#             if player_data['username'] == p[0].username:
#                 GLOBAL_TOURNAMENT['players'] = [player for player in GLOBAL_TOURNAMENT['players'] if player['username'] != p[1].username]
#             elif player_data['username'] == p[1].username:
#                 GLOBAL_TOURNAMENT['players'] = [player for player in GLOBAL_TOURNAMENT['players'] if player['username'] != p[0].username]
#         for p in GLOBAL_TOURNAMENT['players']:
#             print(f"players: {p['username']} id: {p['id']}")
#         print(f"len_players IN_GAME: {len(GLOBAL_TOURNAMENT['players'])}  len_people: {GLOBAL_TOURNAMENT['people']}")
#         if len(GLOBAL_TOURNAMENT['players']) == GLOBAL_TOURNAMENT['people'] / 2:
#             print(f"len_players IN_GAME2: {len(GLOBAL_TOURNAMENT['players'])}  len_people: {GLOBAL_TOURNAMENT['people']}")
#             GLOBAL_TOURNAMENT['fight_list'] = []
#             GLOBAL_TOURNAMENT['status'] = "CONTINUE_GAME"
#             GLOBAL_TOURNAMENT['people'] = GLOBAL_TOURNAMENT['people'] / 2
#             return ({
#                 'status': GLOBAL_TOURNAMENT['status'],
#                 'players': [(p["username"], p["id"]) for p in GLOBAL_TOURNAMENT['players']]
#             })       
#     elif GLOBAL_TOURNAMENT['status'] == "CONTINUE_GAME":
#         game = GLOBAL_TOURNAMENT['game']
#         game.upload_tree([Players(p["id"], p["username"]) for p in GLOBAL_TOURNAMENT['players']])
#         game.print_tournament(game.root)
#         if len(GLOBAL_TOURNAMENT['players']) == GLOBAL_TOURNAMENT['people']:
#             print(f"len_players CONTINUE_GAME: {len(GLOBAL_TOURNAMENT['players'])}  len_people: {GLOBAL_TOURNAMENT['people']} ")
#             if len(game.nodes) == 3:
#                 GLOBAL_TOURNAMENT['status'] = "END_GAME"
#             else:
#                 GLOBAL_TOURNAMENT['status'] = "IN_GAME"
#             GLOBAL_TOURNAMENT['fight_list'] = game.get_players_pair()
#             return ({
#                 'status': GLOBAL_TOURNAMENT['status'],
#                 'players': [(p["username"], p["id"]) for p in GLOBAL_TOURNAMENT['players']]
#             })       
#         return ({
#             'status': GLOBAL_TOURNAMENT['status'],
#             'players': [(p["username"], p["id"]) for p in GLOBAL_TOURNAMENT['players']]
#         })

#     elif GLOBAL_TOURNAMENT['status'] == "END_GAME":
#         return ({
#             'status': 'END_GAME',
#             'winner': GLOBAL_TOURNAMENT['game'].root.username,
#         })

#     return ({
#         'status': GLOBAL_TOURNAMENT['status'],
#         'players': [(p["username"], p["id"]) for p in GLOBAL_TOURNAMENT['players']]
#     })

# class MockRequest:
#     def __init__(self, data):
#         self.data = data
#         self.user = type('User', (), {
#                 'username': data['username'], 
#                 'id': data['id'],
#                 'people': data['people'],
#                 'is_win': False,
#             })

# def generate_users():
#     users = []
#     for i in range(1, 9):
#         user_data = {
#             'status': "WAITING",
#             'people': 8,
#             'is_win': False,
#             'username': f'user{i}',
#             'id': None,
#         }
#         users.append(MockRequest(user_data))
#     return users

# def main():
#     users = generate_users()
#     for user in users:
#         response = game_routing(user)
#     print("rep1", response)
#     flag = True
#     while flag:
#         if response['status'] == 'START_GAME':
#             for user in users:
#                 user.data['status'] = 'START_GAME'
#                 response = game_routing(user)
#             print("rep2", response)
            
            
#         if response['status'] == 'IN_GAME':
#             players = response['players']
#             filtered_players = []
#             for i in range(0, len(players), 2):
#                 pair = players[i:i+2]
#                 if len(pair) == 2:
#                     filtered_players.append(random.choice(pair))

#             users = [user for user in users if any(user.data['username'] == player[0] for player in filtered_players)]
#             for user in users:
#                 user.data['status'] = 'IN_GAME'
#                 response = game_routing(user)
            
#             print("rep3", response)
#         if response['status'] == 'CONTINUE_GAME':
#             players = response['players']
#             filtered_players = []
#             for i in range(0, len(players), 2):
#                 pair = players[i:i+2]
#                 if len(pair) == 2:
#                     filtered_players.append(random.choice(pair))

#             # for p in filtered_players:
#             #     print("usrnaaaame2 ", p[0])
#             users = [user for user in users if any(user.data['username'] == player[0] for player in filtered_players)]
#             for p in users:
#                 print("usrnaaaame2tata ", p.data['username'])
#             for user in users:
#                 user.data['status'] = 'IN_GAME'
#                 # for player in players:
#                 #     if player[0] == user.data['username']:
#                 #         user.data['id'] = player[1]
#                 #         break
#                 print(f"user: {user.data['username']} id: {user.data['id']} status: {user.data['status']}")
#                 response = game_routing(user)
#             print("rep4", response)
#         if response['status'] == 'END_GAME':
#             flag = False
#         sleep(1)


# if __name__ == "__main__":
#     main()