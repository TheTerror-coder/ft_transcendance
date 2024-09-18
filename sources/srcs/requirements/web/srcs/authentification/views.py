from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdatePhotoForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.urls import reverse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import FriendRequest

def register(request):
    if request.method == 'POST':
        print("ici", request.POST)
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return JsonResponse({'status': 'success', 'redirect': True, 'redirect_url': reverse('login')})
        else:
            return (JsonResponse({"error": "found"}, status=302))
    else:
        form = CustomUserCreationForm()
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def connect(request):
    return render(request, 'base.html')

def home(request):
    return render(request, 'home.html')

def login_view(request):
    if request.method == 'POST':
        print("je suis la??????!!!!!!!!", request.POST)
        form = CustomAuthenticationForm(request, data=request.POST)
        print("je suis la??????!!!!!!!!", form)
        if form.is_valid():
            print("OUI JE SUIS VALIDE")
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                home_url = reverse('home')
                return JsonResponse({'status': 'success', 'redirect': True, 'redirect_url': home_url})
            else:
                return JsonResponse({'errors': form.errors}, status=400)
        else:
            print("NON PAS VALIDE")
            return JsonResponse({'errors': form.errors}, status=400)
    else:
        form = CustomAuthenticationForm()
        return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('base')

@login_required
def profile(request):
    return render(request, 'profile.html', {'user': request.user})

@login_required
def update_profile(request):
    if request.method == 'POST':
        form = UpdateUsernameForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = UpdateUsernameForm(instance=request.user)
    return render(request, 'update_profile.html', {'form': form})

@login_required
def update_photo(request):
    if request.method == 'POST':
        form = UpdatePhotoForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = UpdatePhotoForm(instance=request.user)
    return render(request, 'update_photo.html', {'form': form})

@login_required
def friend(request):
    friends = request.user.friend_list.all()
    
    values = {
        'friend_list': friends
    }
    return render(request, 'friend.html', values)

User = get_user_model()

@login_required
def send_friend_request(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        try:
            to_user = User.objects.get(username=username)
            if to_user == request.user:
                messages.error(request, "Vous ne pouvez pas vous ajouter vous-même comme ami.")
            elif FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
                messages.error(request, "Vous avez déjà envoyé une demande d'ami à cet utilisateur.")
            else:
                friend_request = FriendRequest.objects.create(from_user=request.user, to_user=to_user, status='PENDING')
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)('friend_invite', {
                    'type': 'friend.request',
                    'content': f'{request.user.username} vous a envoyé une demande d\'ami.',
                })
                messages.success(request, f"Demande d'ami envoyée à {to_user.username}.")
        except User.DoesNotExist:
            messages.error(request, "Cet utilisateur n'existe pas.")
        return redirect('friend')
    else:
        return render(request, 'friend.html')


@login_required
def remove_friend(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        try:
            friend = User.objects.get(username=username)
            if friend == request.user:
                messages.error(request, "Vous ne pouvez pas vous retirer vous-même comme ami.")
            elif not request.user.friend_list.filter(id=friend.id).exists():
                messages.error(request, "Cet utilisateur n'est pas votre amis.")
            else:
                request.user.friend_list.remove(friend)
                messages.success(request, f"{friend.username} a été retiré avec succées")
        except User.DoesNotExist:
            messages.error(request, "Cet utilisateur n'existe pas.")
        return redirect('friend')
    else:
        return render(request, 'friend.html')

@login_required
def users(request, username):
    user = get_object_or_404(User, username=username)
    return render(request, 'user.html', {'user': user})


