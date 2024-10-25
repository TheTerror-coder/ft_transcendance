from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdatePhotoForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.urls import reverse
from .models import FriendRequest
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from authentification.consumers.consumers import user_sockets
from django.views.decorators.http import require_POST

# envoyer un msg si meme email et ne pas rediriger sur home une fois register
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

@login_required
@method_decorator(csrf_protect, name='dispatch')
def update_profile(request):
    if request.method == 'POST':
        form = UpdateUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            reponse = {
                'status': 'success',
                'message': 'Nom d\'utilisateur mis à jour avec succès.'
            }
            return repostJson(reponse)
    else:
        form = UpdateUsernameForm(instance=request.user)
    reponse = {
        'status': 'error',
        'message': 'Erreur lors de la mise à jour du nom d\'utilisateur.'
    }
    return reponseJson(reponse)


@require_POST
@login_required
@csrf_protect
def update_photo(request):
    if request.method == 'POST':
        form = UpdatePhotoForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            reponse = {
                'status': 'success',
                'message': 'Photo de profil mise à jour avec succès.'
            }
            return reponseJson(reponse)
    else:
        form = UpdatePhotoForm(instance=request.user)
    reponse = {
        'status': 'error',
        'message': 'Erreur lors de la mise à jour de la photo de profil.'
    }
    return reponseJson(reponse)


@require_POST
@login_required
@csrf_protect
def profile(request):
    friends = request.user.friend_list.all()
    friend_list = [{'username': friend.username} for friend in friends]

    pending_requests = FriendRequest.objects.filter(
        to_user=request.user,
        status='PENDING'
    )
    pending_request_list = [{'from_user': request.from_user.username, 'friend_request_id': request.id} for request in pending_requests]

    response_data = {
        'friends': friend_list,
        'pending_requests': pending_request_list,
        'username': request.user.username,
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
            return JsonResponse({
                'status': 'error',
                'message': "Le nom d'utilisateur est requis."
            })

        try:
            friend = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({
                'status': 'error',
                'message': "Cet utilisateur n'existe pas."
            })

        if friend == request.user:
            return JsonResponse({
                'status': 'error',
                'message': "Vous ne pouvez pas vous retirer vous-même comme ami."
            })

        if not request.user.friend_list.filter(id=friend.id).exists():
            return JsonResponse({
                'status': 'error',
                'message': "Cet utilisateur n'est pas votre ami."
            })

        request.user.friend_list.remove(friend)
        return JsonResponse({
            'status': 'success',
            'message': f"{friend.username} a été retiré avec succès."
        })
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
