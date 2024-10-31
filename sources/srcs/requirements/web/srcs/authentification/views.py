from django.shortcuts import render, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdatePhotoForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.urls import reverse
from .models import FriendRequest
from django.views.decorators.csrf import csrf_protect
from authentification.consumers.consumers import user_sockets
from django.views.decorators.http import require_POST, require_http_methods
import json
import os
from django.utils.crypto import get_random_string


@require_POST
@csrf_protect
def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def connect(request):
    return render(request, 'base.html')


# envoyer le msg nom d'utilisateur n'existe pas
@require_POST
@csrf_protect
def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.username in user_sockets:
                    return JsonResponse({'status': 'error', 'msgError': f'user: {request.user.username} is already connected!'}, status=400)
                login(request, user)
                return JsonResponse({'status': 'success', 'username': user.username})
            else:
                return JsonResponse({'status': 'error', 'msgError': form.errors}, status=400)
        else:
            return JsonResponse({'status': 'error', 'msgError': 'incorrect passwords'}, status=400)
    return JsonResponse({'status': 'error', 'msgError': 'request method POST not accepted'}, status=405)

def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success', 'redirect': True, 'redirect_url': reverse('base')})


# check si l'utilisateur exite deja 
@require_POST
@login_required
@csrf_protect
def update_profile(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    
    form = UpdateUsernameForm({'username': username}, instance=request.user)
    
    if form.is_valid():
        form.save()
        response = {
            'status': 'success',
            'message': 'Nom d\'utilisateur mis à jour avec succès.'
        }
        return JsonResponse(response)
    response = {
        'status': 'error',
        'message': form.errors.get('username', ['Erreur inconnue'])[0]
    }
    return JsonResponse(response, status=400)


@require_POST
@login_required
@csrf_protect
def update_photo(request):
    if 'photo' not in request.FILES:
        return JsonResponse({'status': 'error', 'message': 'Aucun fichier reçu'}, status=400)

    file = request.FILES['photo']
    if len(file.name) > 100:
        file_extension = os.path.splitext(file.name)[1]
        file.name = f"{get_random_string(10)}{file_extension}"
    form = UpdatePhotoForm(request.POST, {'photo': file}, instance=request.user)
    if form.is_valid():
        form.save()
        response = {
            'status': 'success',
            'message': 'Photo de profil mise à jour avec succès.'
        }
        return JsonResponse(response)
    else:
        response = {
            'status': 'error',
            'message': 'Erreur lors de la mise à jour de la photo de profil.',
        }
        return JsonResponse(response)


@require_http_methods(["GET", "POST"])
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
            "date": game.date.strftime("%Y-%m-%d %H:%M:%S"),  # Formater la date en chaîne de caractères
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
        'pending_requests': pending_request_list,
        'username': request.user.username,
        'recent_games': recent_games_data,
    }
    return JsonResponse(response_data)



User = get_user_model()


@require_POST
@login_required
@csrf_protect
def send_friend_request(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        try:
            to_user = User.objects.get(username=username)
            if to_user == request.user:
                response = {
                    'status': 'error',
                    'message': "Vous ne pouvez pas vous ajouter vous-même comme ami."
                }
                return JsonResponse(response)
            elif FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
                response = {
                    'status': 'error',
                    'message': "Vous avez déjà envoyé une demande d'ami à cet utilisateur."
                }
                return JsonResponse(response)
            elif to_user in request.user.friend_list.all():
                response = {
                    'status': 'error',
                    'message': "Cet utilisateur est déjà votre ami."
                }
                return JsonResponse(response)
            else:
                response = {
                    'status': 'success',
                    'message': f"Demande d'ami envoyée à {to_user.username}.",
                }
                return JsonResponse(response)
        except User.DoesNotExist:
            response = {
                'status': 'error',
                'message': "Cet utilisateur n'existe pas."
            }
            return JsonResponse(response)
    else:
        response = {
            'status': 'error',
            'message': "Invalid request method."
        }
        return JsonResponse(response)


@require_POST
@login_required
@csrf_protect
def remove_friend(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        if not username:
            response = {
                'status': 'error',
                'message': "Le nom d'utilisateur est requis."
            }
            return JsonResponse(response)

        try:
            friend = User.objects.get(username=username)
        except User.DoesNotExist:
            response = {
                'status': 'error',
                'message': "Cet utilisateur n'existe pas."
            }
            return JsonResponse(response)

        if friend == request.user:
            response = {
                'status': 'error',
                'message': "Vous ne pouvez pas vous retirer vous-même comme ami."
            }
            return JsonResponse(response)

        if not request.user.friend_list.filter(id=friend.id).exists():
            response = {
                'status': 'error',
                'message': "Cet utilisateur n'est pas votre ami."
            }
            return JsonResponse(response)

        request.user.friend_list.remove(friend)
        response = {
            'status': 'success',
            'message': f"{friend.username} a été retiré avec succès."
        }
        return JsonResponse(response)
    else:
        response = {
            'status': 'error',
            'message': "Invalid request method."
        }
        return JsonResponse(response)


@login_required
def users(request, username):
    user = get_object_or_404(User, username=username)
    return render(request, 'user.html', {'user': user})
