from django.shortcuts import render
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdatePhotoForm
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import FriendRequest
from django.views.decorators.csrf import csrf_protect
from usermanagement.consumers import user_sockets
from django.utils.crypto import get_random_string
from rest_framework.response import Response
from rest_framework.decorators import api_view
import os
import sys



User = get_user_model()
list_users = User.objects.all()

# accept multiple username
@api_view(['POST'])
@csrf_protect
def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.data, request.FILES)
        if form.is_valid():
            form.save()
            return Response({'status': 'success'})
        else:
            error_messages = {field: error_list for field, error_list in form.errors.items()}
            return Response({
                'status': 'error',
                'message': 'Validation failed. Please correct the errors below.',
                'errors': error_messages
            }, status=400)
    return Response({'error': 'Invalid request method'}, status=405)


def connect(request):
    return render(request, 'base.html')


@api_view(['POST'])
@csrf_protect
def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(data=request.data)
        if form.is_valid():
            password = form.cleaned_data.get('password')
            email = form.cleaned_data.get('email')
            user = authenticate(email=email, password=password)
            if user is not None:
                if user.username in user_sockets:
                    return Response({
                        'status': 'error',
                        'message': f'user: {user.username} is already connected!',
                    }, status=400)
                login(request, user)
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

def logout_view(request):
    logout(request)
    return Response({'status': 'success', 'redirect': True, 'redirect_url': reverse('base')})

# check si l'utilisateur exite deja ou pas
@api_view(['POST'])
@login_required
@csrf_protect
def update_profile(request):
    print("update-profile", list_users, file=sys.stderr)
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


@api_view(['POST'])
@login_required
@csrf_protect
def update_photo(request):
    print("update_photo", file=sys.stderr)
    if 'picture' not in request.FILES:
        return Response({
            'status': 'error',
            'message': 'No file received.',
        }, status=400)

    file = request.FILES['picture']
    if len(file.name) > 100:
        file_extension = os.path.splitext(file.name)[1]
        file.name = f"{get_random_string(10)}{file_extension}"
    form = UpdatePhotoForm(request.POST, {'photo': file}, instance=request.user)
    if form.is_valid():
        user = request.user
        user.photo = form.cleaned_data['photo']
        form.save()
        return Response({
            'status': 'success',
            'message': 'Profile picture updated successfully.',
        }, status=200)
    else:
        form = UpdatePhotoForm()
        error_messages = {field: error_list for field, error_list in form.errors.items()}
        return Response({
            'status': 'error',
            'errors': error_messages,
        }, status=400)




@api_view(['GET'])
@login_required
@csrf_protect
def profile(request):
    friends = request.user.friend_list.all()
    friend_list = [{'username': friend.username} for friend in friends]
    last_three_games = request.user.recent_games()

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
        'user_socket': user_sockets,
        'pending_requests': pending_request_list,
        'username': request.user.username,
        'recent_games': recent_games_data,
    }
    return Response(response_data)





@api_view(['POST'])
@login_required
@csrf_protect
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
@login_required
@csrf_protect
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
@login_required
@csrf_protect
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
    }, status=200)