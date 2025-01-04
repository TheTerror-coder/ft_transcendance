import json
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdateUserLanguageForm
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import FriendRequest
from django.views.decorators.csrf import csrf_protect
from usermanagement.consumers import user_sockets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.decorators import permission_classes
from .tokens import customObtainJwtTokenPair
from django.core.files.storage import FileSystemStorage
import os
from random import random
from .tournament import Tournament, Players
import sys
from allauth.account.utils import setup_user_email
from allauth.account.adapter import get_adapter as allauth_acount_get_adapter
from allauth.account.models import EmailAddress
from allauth.account.internal.flows.login import record_authentication
from allauth.mfa.adapter import get_adapter as allauth_mfa_get_adapter
from allauth.headless.internal.decorators import browser_view
from channels.layers import get_channel_layer


GLOBAL_TOURNAMENT = {
    "game": None,
    "players": [],
    "status": "WAITING",  # WAITING -> STARTGAME -> IN_GAME -> END_GAME
}


@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def register(request):
	if request.method == 'POST':
		print("register", request.data, file=sys.stderr)
		form = CustomUserCreationForm(request.data, request.FILES)
		if form.is_valid():
			form.save()
			user = authenticate(email=request.data['email'], password=request.data['password1'])
			if user is not None:
### jm custom beginning ###
				adapter = allauth_acount_get_adapter()
				email = user.email;
				primary = setup_user_email(request, user, [EmailAddress(email=email)] if email else [])
				ret = adapter.confirm_email(request, primary)
				if ret:
					adapter.stash_verified_email(request, email)
### jm custom end ###
				login(request, user)
### jm custom beginning ###
				customObtainJwtTokenPair(request, user)
				record_authentication(request, "password", username=user.username)
### jm custom end ###
			return Response({'status': 'success'})
		else:
			error_messages = {field: error_list for field, error_list in form.errors.items()}
			return Response({
				'status': 'error',
				'message': 'Validation failed. Please correct the errors below.',
				'errors': error_messages
			}, status=400)
	return Response({'error': 'Invalid request method'}, status=405)

# ###TODO: Nico is this view used?
def connect(request):
	return render(request, 'base.html')


@browser_view
@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def login_view(request):
	if request.method == 'POST':
		form = CustomAuthenticationForm(data=request.data)
		if form.is_valid():
			password = form.cleaned_data.get('password')
			email = form.cleaned_data.get('email')
			user = authenticate(email=email, password=password)
			if user is not None:
### jm custom beginning ###
				if allauth_mfa_get_adapter().is_mfa_enabled(user, ['totp']):
					return perform_mfa_stage(request)
### jm custom end ###
				if user.username in user_sockets: ###TODO Nico: this can be a concern Nico
					return Response({
						'status': 'error',
						'message': f'user: {user.username} is already connected!',
					}, status=400)
				login(request, user)
### jm custom beginning ###
				record_authentication(request, "password", email=user.email, username=user.username)
				customObtainJwtTokenPair(request, user)
### jm custom end ###
				return Response({'status': 'success', 'username': user.username, 'user_id': user.id})
			else:
				error_messages = {field: error_list for field, error_list in form.errors.items()}
				return Response({
					'status': 'error',
					'message': 'Validation failed. Please correct the errors below.',
					'errors': error_messages
				}, status=400)
		else:
			error_messages = {field: error_list for field, error_list in form.errors.items()}
			return Response({
				'status': 'error',
				'message': 'Validation failed. Please correct the errors below.',
				'errors': error_messages
			}, status=400)
	return Response({'status': 'error', 'msgError': 'request method POST not accepted'}, status=405)

# @api_view(['GET'])
# @csrf_protect
# @permission_classes([AllowAny])
# def logout_view(request):
# 	logout(request)
# 	if request.user.username in user_sockets:
# 		del user_sockets[request.user.username]
# 	return Response({
# 		'status': 'success',
# 		'redirect': True,
# 		'redirect_url': reverse('login')
# 	})
    

@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def logout_view(request):
	logout(request)
	username = request.data.get('username')
	# if username in user_sockets:
	# 	channel_name = user_sockets[username]
	# 	channel_layer = get_channel_layer()
	# 	print("logout_view caca||", channel_layer, file=sys.stderr)
	# 	channel_layer.send(channel_name, {
	# 		'type': 'websocket.close'
	# 	})
	del user_sockets[username]
	return Response({
		'status': 'success',
		'redirect': True,
		'redirect_url': reverse('login')
	})




# check si l'utilisateur exite deja ou pas
@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def update_profile(request):
	print("update-profile", request.data, file=sys.stderr)
	username = request.data.get('username')
	form = UpdateUsernameForm({'username': username}, instance=request.user)
	
	if form.is_valid():
		form.save()
		return Response({
			'status': 'success',
			'message': 'Profile picture updated successfully.',
		}, status=200)
	else:
		return Response({
			'status': 'error',
			'message': form.errors.get('username', ['Erreur inconnue'])[0],
		}, status=400)

User = get_user_model()

@api_view(['POST'])
@csrf_protect
# @permission_classes([IsAuthenticated])
@login_required
def update_photo(request):
	if 'picture' not in request.FILES:
		return Response({
			'status': 'error',
			'message': 'No file received.',
		}, status=400)
	uploaded_file = request.FILES['picture']
	check_file = uploaded_file.name.split('.')[-1].lower()
	valid_extensions = ['png', 'jpg', 'jpeg', 'webp']
	if check_file not in valid_extensions:
		return Response({
			'status': 'error',
			'message': 'Unsupported file extension. Only .png, .jpg, .jpeg, and .webp files are allowed.',
		}, status=400)
	fs = FileSystemStorage()
	print("*******DEBUG********uploaded_file.name: ", uploaded_file.name, file=sys.stderr)
	filename = fs.save('photos/' + uploaded_file.name, uploaded_file)
	file_url = fs.url(filename)
	print("*******DEBUG********file_url", file_url, file=sys.stderr)
	user = request.user
	user.photo = filename
	print("*******DEBUG********user.photo: ", user.photo, file=sys.stderr)
	user.save()
	if user.photo.url:
		return Response({
			'status': 'success',
			'photo': user.photo.url,
			'message': 'Profile picture updated successfully.',
		}, status=200)
	else:
		form = UpdatePhotoForm()
		error_messages = {field: error_list for field, error_list in form.errors.items()}
		return Response({
			'status': 'error',
			'errors': error_messages,
		}, status=400)



@api_view(['POST', 'GET'])
@csrf_protect
@permission_classes([AllowAny])
def set_language(request):
    
    username = request.data.get('username')
    language = request.data.get('language')
    
    if not username:
        return Response({
            'status': 'error',
            'message': 'Le nom d\'utilisateur est requis.'
        }, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Utilisateur introuvable.'
        }, status=404)
    
    form = UpdateUserLanguageForm({'language': language})

    if form.is_valid():
        user.language = form.cleaned_data['language']
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'La langue a été changée.',
        }, status=200)
    else:
        return Response({
            'status': 'error',
            'message': form.errors.get('language', ['Erreur inconnue'])[0],
        }, status=400)



@api_view(['GET', 'POST'])
@csrf_protect
@permission_classes([AllowAny])
def get_language(request):
    
    username = request.data.get('username')
    
    if not username:
        return Response({
            'status': 'error',
        }, status=400)
    
    try:
        to_user = User.objects.get(username=username)
        return Response({
            'status': 'success',
            'language': to_user.language,
        }, status=200)
    except User.DoesNotExist:
        return Response({
            'status': 'error',
        }, status=400)


@api_view(['POST'])
@login_required
@csrf_protect
def get_user_profile(request):
    username = request.data.get('username')
    prime = request.data.get('prime')
    try:
        to_user = User.objects.get(username=username)
        user_info = {
            'username': to_user.username,
            'email': to_user.email,
            'first_name': to_user.first_name,
            'last_name': to_user.last_name,
            'is_active': to_user.is_active,
            'date_joined': to_user.date_joined,
            'game played': to_user.recent_games(),
            'victorie': to_user.victories,
            'prime': prime,
            'language': to_user.language,
        }
        if to_user.photo_link:
            print("***********DEBUG*********: get_user_profile(): photo_link is not empty: ", file=sys.stderr)
            user_info['photo'] = to_user.photo_link 
        elif to_user.photo:
            user_info['photo'] = to_user.photo.url 
        else:
            user_info['photo'] = None

        print("User profile info:", user_info, file=sys.stderr)
        return Response({
            'status': 'success',
            'user_info': user_info,
        }, status=200)

    except User.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'User not found',
        }, status=404)


@api_view(['POST', 'GET'])
@login_required
@csrf_protect
def game_routing(request):
	global GLOBAL_TOURNAMENT
	status = request.data.get('status')
	player = Players(request.user.id, request.user.username, request.user.is_win)

	if GLOBAL_TOURNAMENT['status'] == "WAITING":
		if player not in GLOBAL_TOURNAMENT['players']:
			GLOBAL_TOURNAMENT['players'].append(player)            
		if len(GLOBAL_TOURNAMENT['players']) == request.user.people:
			GLOBAL_TOURNAMENT['status'] = "START_GAME"
	if status == 'START_GAME' and GLOBAL_TOURNAMENT['status'] == "START_GAME":
		if GLOBAL_TOURNAMENT['game'] is None:
			players = GLOBAL_TOURNAMENT['players']
			random.shuffle(players)
			for idx, player in enumerate(players, start=1):
				player.id = idx
			game = Tournament()
			game.create_tree(len(players))
			game.assign_players(players)
			GLOBAL_TOURNAMENT['game'] = game
			GLOBAL_TOURNAMENT['status'] = "IN_GAME"
			game.print_tournament(game.root)
		return {'status': GLOBAL_TOURNAMENT['status'], 'players': [(p.username, p.id) for p in players]}
	elif status == 'IN_GAME' and GLOBAL_TOURNAMENT['status'] == "IN_GAME":
		game = GLOBAL_TOURNAMENT['game']

		if player.is_win == True:
			pairs = game.get_players_pair()
			winners = [pair[0] if pair[0].username == player.username else pair[1] for pair in enumerate(pairs)]
			calculate_score(player.username, pair[1].username, True)

		# pairs = game.get_players_pair()
		# winners = [pair[0] if i % 2 == 0 else pair[1] for i, pair in enumerate(pairs)]
		
		game.update_tree(winners)
		game.print_tournament(game.root)
		GLOBAL_TOURNAMENT['players'] = game.players
		print("len p: ", len(game.players))
		if len(game.players) == 1:
			GLOBAL_TOURNAMENT['status'] = "END_GAME"
		return {'status': GLOBAL_TOURNAMENT['status'], 'players': [(p.username, p.id) for p in game.players]}
	elif GLOBAL_TOURNAMENT['status'] == "END_GAME":
		return {'status': 'END_GAME', 'message': 'The game has ended'}
	return {'status': GLOBAL_TOURNAMENT['status'], 'message': 'Unexpected status'}




@api_view(['GET'])
@csrf_protect
@permission_classes([IsAuthenticated])
def profile(request):
	friends = request.user.friend_list.all()
	friend_list = [{'username': friend.username} for friend in friends]
	last_three_games = request.user.recent_games()
	# photo = request.user.photo.url if request.user.photo else None
	if request.user.photo_link:
		print("***********DEBUG*********: profile(): photo_link is not empty: ", file=sys.stderr)
		photo = request.user.photo_link 
	elif request.user.photo:
		photo = request.user.photo.url 
	else:
		photo = None
	prime = request.user.prime

	recent_games_data = [
		{
			"opponent": game.opponent.username,
			"player_score": game.player_score,
			"opponent_score": game.opponent_score,
			"date": game.date.strftime("%Y-%m-%d %H:%M:%S"),
		}
		for game in last_three_games
	]


	pending_requests = FriendRequest.objects.filter(
		to_user=request.user,
		status='PENDING'
	)
	pending_request_list = [{'from_user': request.from_user.username, 'friend_request_id': request.id} for request in pending_requests]

	response_data = {
		'friends': friend_list,
		'photo': photo,
		'user_socket': user_sockets,
		'pending_requests': pending_request_list,
		'username': request.user.username,
		'recent_games': recent_games_data,
		'prime': prime,
	}
	return Response(response_data)



@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def send_friend_request(request):
	if request.method == 'POST':
		username = request.data.get('username')
		try:
			to_user = User.objects.get(username=username)
			if to_user == request.user:
				return Response({
					'status': 'error',
					'message': "Vous ne pouvez pas vous ajouter vous-même comme ami."
				}, status=400)
			elif FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
				return Response({
					'status': 'error',
					'message': "Vous avez déjà envoyé une demande d'ami à cet utilisateur."
				}, status=400)
			elif to_user in request.user.friend_list.all():
				return Response({
					'status': 'error',
					'message': "Cet utilisateur est déjà votre ami."
				}, status=400)
			else:
				return Response({
					'status': 'success',
					'username': to_user.username,
					'message': f"Demande d'ami envoyée à {to_user.username}.",
				}, status=200)
		except User.DoesNotExist:
			return Response({
				'status': 'error',
				'message': "Cet utilisateur n'existe pas."
			}, status=400)
	else:
		return Response({
			'status': 'error',
			'message': "Invalid request method."
		}, status=400)


@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def remove_friend(request):
	if request.method == 'POST':
		username = request.data.get('username')
		if not username:
			response = {
				'status': 'error',
				'message': "Le nom d'utilisateur est requis."
			}
			return Response(response)

		try:
			friend = User.objects.get(username=username)
		except User.DoesNotExist:
			response = {
				'status': 'error',
				'message': "Cet utilisateur n'existe pas."
			}
			return Response(response)

		if friend == request.user:
			response = {
				'status': 'error',
				'message': "Vous ne pouvez pas vous retirer vous-même comme ami."
			}
			return Response(response)

		if not request.user.friend_list.filter(id=friend.id).exists():
			response = {
				'status': 'error',
				'message': "Cet utilisateur n'est pas votre ami."
			}
			return Response(response)

		request.user.friend_list.remove(friend)
		friend.friend_list.remove(request.user)
		response = {
			'status': 'success',
			'message': f"{username} a été retiré avec succès."
		}
		return Response(response)
	else:
		response = {
			'status': 'error',
			'message': "Invalid request method."
		}
		return Response(response)

@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def get_user_sockets(request):
	print("get_user_sockets", request.data, file=sys.stderr)
	if request.data.get('username') in user_sockets:
		return Response({
			'status': 'success',
			'sockets': user_sockets[request.data.get('username')]
		}, status=200)
	else:
		return Response({
			'status': 'error',
			'message': 'User not connected'
		}, status=400)
	
@api_view(['GET'])
@login_required
@csrf_protect
def get_user(request):
	return Response({
		'status': 'success',
		'username': request.user.username,
		'language': request.user.language,
	}, status=200)

def calculate_score(user_username, opponent_username, player_won):
	user = User.objects.get(username=user_username)
	opponent = User.objects.get(username=opponent_username)
	player_score = (user.victories / user.game_played) * 100 if user.game_played > 0 else 0
	opponent_score = (opponent.victories / opponent.game_played) * 100 if opponent.game_played > 0 else 0

	if player_won:
		if player_score < opponent_score:
			player_cote_change = (opponent_score - player_score) * 1.5
			opponent_cote_change = -(opponent_score - player_score) * 1.2
		else:
			player_cote_change = (opponent_score - player_score) * 1.2
			opponent_cote_change = -(opponent_score - player_score) * 1.1
	else:
		if opponent_score < player_score:
			opponent_cote_change = (player_score - opponent_score) * 1.5
			player_cote_change = -(player_score - opponent_score) * 1.2
		else:
			opponent_cote_change = (player_score - opponent_score) * 1.2
			player_cote_change = -(player_score - opponent_score) * 1.1

	player_score += player_cote_change
	opponent_score += opponent_cote_change

	user.prime = max(player_score, 0)
	user.game_played += 1
	user.victories += 1
	user.save()
	opponent.prime = max(opponent_score, 0)
	opponent.game_played += 1
	opponent.save()

# @api_view(['POST'])
# @login_required
# @csrf_protect
# def set_info_game(request):
# 	prime = request.data.get('prime')
# 	user = request.user
# 	user.prime = prime
# 	user.save()
# 	return Response({
# 		'status': 'success',
# 		'message': 'Prime status updated successfully.',
# 	}, status=200)

def perform_mfa_stage(request):
	from allauth.headless.account.inputs import LoginInput
	from allauth.headless.internal.restkit.response import ErrorResponse
	from allauth.headless.base.response import AuthenticationResponse


	input = LoginInput(data=request.data)
	if not input.is_valid():
		return ErrorResponse(request, input=input)
	credentials = input.clean()
	record_authentication(request, method="password", **credentials)
	resume_login(request, input.login)
	return AuthenticationResponse(request)

def resume_login(request, login):
	from allauth.account.stages import LoginStageController
	from allauth.core.exceptions import ImmediateHttpResponse


	ctrl = LoginStageController(request, login)
	try:
		response = ctrl.handle()
		if response:
			return response
	except ImmediateHttpResponse as e:
		print ("********DEBUG*********perform_mfa_stage***ImmediateHttpResponse exception ", e, file=sys.stderr)
		response = e.response
	return response