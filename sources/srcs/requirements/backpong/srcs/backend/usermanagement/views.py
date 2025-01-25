import json
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdateUserLanguageForm
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import FriendRequest, Game
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
import sys
from allauth.account.utils import setup_user_email
from allauth.account.adapter import get_adapter as allauth_acount_get_adapter
from allauth.account.models import EmailAddress
from allauth.account.internal.flows.login import record_authentication
from allauth.mfa.adapter import get_adapter as allauth_mfa_get_adapter
from allauth.headless.internal.decorators import browser_view
from channels.layers import get_channel_layer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import async_to_sync
from PIL import Image
from time import sleep


@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def register(request):
	if request.method == 'POST':
		form = CustomUserCreationForm(request.data, request.FILES)
		if form.is_valid():
			form.save()
			user = authenticate(email=request.data['email'], password=request.data['password1'])
			if user is not None:
				adapter = allauth_acount_get_adapter()
				email = user.email
				primary = setup_user_email(request, user, [EmailAddress(email=email)] if email else [])
				ret = adapter.confirm_email(request, primary)
				if ret:
					adapter.stash_verified_email(request, email)
				login(request, user)
				customObtainJwtTokenPair(request, user)
				record_authentication(request, "password", username=user.username)
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
				if allauth_mfa_get_adapter().is_mfa_enabled(user, ['totp']):
					return perform_mfa_stage(request)
				if user.username in user_sockets:
					return Response({
						'status': 'error',
						'message': f'user: {user.username} is already connected!',
					}, status=400)
				login(request, user)
				record_authentication(request, "password", email=user.email, username=user.username)
				customObtainJwtTokenPair(request, user)

				for username, channel_name in user_sockets.items():
					if username != user:
						channel_layer = get_channel_layer()
						async_to_sync(channel_layer.send)(
							channel_name,
							{
								"type": "update.login",
								"username": user.username,
								"to_user": username,
							}
						)
						break

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


@api_view(['POST'])
@csrf_protect
@permission_classes([AllowAny])
def logout_view(request):
	logout(request)
	username = request.data.get('username')
	if not username:
		return Response({
			'status': 'error',
			'message': 'Le nom d\'utilisateur est requis.'
		}, status=400)

	channel_layer = get_channel_layer()
	for user, channel_name in user_sockets.items():
		if user != username:
			async_to_sync(channel_layer.send)(
				channel_name,
				{
					"type": "update.logout",
					"username": username,
				}
			)
			break
	return Response({
		'status': 'success',
		'redirect': True,
		'redirect_url': reverse('login')
	}, status=200)


@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def update_profile(request):
	username = request.data.get('username')
	before_username = request.user.username
	if not username:
		return Response({
			'status': 'error',
			'message': 'username not found',
		}, status=400)
	form = UpdateUsernameForm({'username': username}, instance=request.user)
	if form.is_valid():
		for user, channel_name in user_sockets.items():
			if user != username:
				channel_layer = get_channel_layer()
				async_to_sync(channel_layer.send)(
					channel_name,
					{
						"type": "update.username",
						"new_username": username,
					}
				)
				break
		form.save()
		return Response({
			'status': 'success',
			'message': 'Profile updated successfully.',
		}, status=200)
	else:
		return Response({
			'status': 'error',
			'message': form.errors.get('username', ['Erreur inconnue'])[0],
		}, status=400)



User = get_user_model()

@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
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

	try:
		img = Image.open(uploaded_file)
		img.verify()
		img.close()
	except (IOError, SyntaxError) as e:
		return Response({
			'status': 'error',
			'message': 'Invalid image file.',
		}, status=400)
	fs = FileSystemStorage()
	try:
		filename = fs.save('photos/' + uploaded_file.name, uploaded_file)
	except ValueError as e:
		return Response({
			'status': 'error',
			'message': str(e),
		}, status=400)
	file_url = fs.url(filename)
	user = request.user
	print("uploaded_file: ", user.photo, file=sys.stderr)
	user.photo = filename
	print("uploaded_file: ", user.photo, file=sys.stderr)
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
	try:
		user = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({
			'status': 'error',
			'message': 'Utilisateur introuvable.'
		}, status=404)

	form = UpdateUserLanguageForm({'language': language})
	if form.is_valid():
		user.language = language
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
			'message': 'Le nom d\'utilisateur est requis.'
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
@csrf_protect
@permission_classes([AllowAny])
def get_user_profile(request):
	username = request.data.get('username')
	if not username:
		return Response({
			status: 'error',
			message: 'Le nom d\'utilisateur est requis.'
		}, status=400)
	try:
		to_user = User.objects.get(username=username)
		recent_games = to_user.recent_games()
		games_data = []
		for game in recent_games:
			game_info = {
				'player': game.player.username,
				'opponent': game.opponent.username,
				'player_score': game.player_score,
				'opponent_score': game.opponent_score,
				'date': game.date,
			}
			games_data.append(game_info)
		user_info = {
			'id': to_user.id,
			'username': to_user.username,
			'email': to_user.email,
			'first_name': to_user.first_name,
			'last_name': to_user.last_name,
			'is_active': to_user.is_active,
			'date_joined': to_user.date_joined,
			'nbr_of_games': to_user.games_played,
			'recent_games': games_data,
			'victorie': to_user.victories,
			'loose': to_user.loose,
			'prime': to_user.prime,
			'language': to_user.language,
		}
		if to_user.photo_link:
			user_info['photo'] = to_user.photo_link 
		elif to_user.photo:
			user_info['photo'] = to_user.photo.url 
		else:
			user_info['photo'] = None

		return Response({
			'status': 'success',
			'user_info': user_info,
		}, status=200)

	except User.DoesNotExist:
		return Response({
			'status': 'error',
			'message': 'User not found',
		}, status=404)


@api_view(['GET'])
@csrf_protect
@permission_classes([IsAuthenticated])
def profile(request):
	friends = request.user.friend_list.all()
	friend_list = [{'username': friend.username} for friend in friends]
	if request.user.photo_link:
		photo = request.user.photo_link 
	elif request.user.photo:
		photo = request.user.photo.url 
	else:
		photo = None
	prime = request.user.prime
 
	to_user = request.user
	recent_games = to_user.recent_games()
	games_data = []
	for game in recent_games:
		game_info = {
			'player': game.player.username,
			'opponent': game.opponent.username,
			'player_score': game.player_score,
			'opponent_score': game.opponent_score,
			'date': game.date,
		}
		games_data.append(game_info)


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
		'loose': request.user.loose,
		'victories': request.user.victories,
		'recent_games': games_data,
		'nbr_of_games': request.user.games_played,
		'prime': prime,
	}
	return Response(response_data)



@api_view(['POST'])
@csrf_protect
@permission_classes([IsAuthenticated])
def send_friend_request(request):
	if request.method == 'POST':
		username = request.data.get('username')
    
		if not username:
			return Response({
				'status': 'error',
				'message': "Le nom d'utilisateur est requis."
			}, status=400)

		if not isinstance(username, str) or len(username.strip()) == 0:
			return Response({
				'status': 'error',
				'message': "Le nom d'utilisateur doit être une chaîne non vide."
			}, status=400)

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
	print("***********************remove friend: ICI**************", file=sys.stderr)
	if request.method == 'POST':
		username = request.data.get('username')
		if not username:
			response = {
				'status': 'error',
				'message': "Le nom d'utilisateur est requis."
			}
			return Response(response)
		if not isinstance(username, str) or len(username.strip()) == 0:
			response = {
				'status': 'error',
				'message': "Le nom d'utilisateur doit être une chaîne non vide."
			}
			return Response(response, status=400)
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
		if request.user.username in user_sockets:
			friend_liste = request.user.friend_list.all()
			for user in friend_liste:
				if user.username != request.user.username:
					try:
						print("remove friend: ICI", user.username, file=sys.stderr)
						socket_value = user_sockets[user.username]
						channel_layer = get_channel_layer()
						async_to_sync(channel_layer.send)(
						socket_value,
							{
								'type': 'remove.friend',
								'target_username': user.username,
							},
						)
					except Exception as e:
						request.user.friend_list.remove(friend)
						friend.friend_list.remove(request.user)
						return Response({
							'status': 'error',
							'message': f"Error: {e}",
						}, status=400)
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
	username = request.data.get('username')
	if not username:
		return Response({
			'status': 'error',
			'message': "'username' est requis dans la requête."
		}, status=400)
	if username in user_sockets:
		return Response({
			'status': 'success',
			'sockets': user_sockets[username]
		}, status=200)
	else:
		return Response({
			'status': 'error',
			'message': 'User not connected'
		}, status=400)

@api_view(['GET'])
@csrf_protect
@permission_classes([AllowAny])
def get_user(request):
	if isinstance(request.user, AnonymousUser):
		return Response({
			'status': 'error',
			'message': 'User is not authenticated',
		}, status=401)
	return Response({
		'status': 'success',
		'username': request.user.username,
		'language': request.user.language,
	}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def set_info_game(request):
	if request.data.get('player') == request.data.get('winner'):
		winner = request.data.get('player')
		winner_score = int(request.data.get('player_score'))
		looser = request.data.get('opponent')
		looser_score = int(request.data.get('opponent_score'))
	else:
		winner = request.data.get('opponent')
		looser = request.data.get('player')
		winner_score = int(request.data.get('opponent_score'))
		looser_score = int(request.data.get('player_score'))

	if not winner or not looser or winner_score is None or looser_score is None:
		return Response({
			'status': 'error',
			'message': "Données manquantes. Assurez-vous que 'player', 'opponent', 'player_score' et 'opponent_score' sont fournis."
		}, status=400)
  
	if winner == looser:
		return Response({
			'status': 'error',
			'message': "Vous ne pouvez pas jouer contre vous-même."
		}, status=400)
	
	try:
		user_win = User.objects.get(username=winner)
		user_loose = User.objects.get(username=looser)

	except User.DoesNotExist:
		return Response({'status': 'error', 'message': "Un des joueurs n'existe pas."}, status=400)
	

	game = Game.objects.create(
		player=user_win,
		opponent=user_loose,
		player_score=winner_score,
		opponent_score=looser_score,
	)

	user_loose.prime = user_loose.prime - 500 if user_loose.prime > 500 else 0
	user_win.prime = user_win.prime + 1000
	user_win.victories += 1
	user_win.games_played += 1
	user_loose.games_played += 1
	user_loose.loose += 1
	user_win.save()
	user_loose.save()

	return Response({
		'status': 'success',
		'message': 'Données de la partie enregistrées avec succès.',
	}, status=200)

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
		response = e.response
	return response