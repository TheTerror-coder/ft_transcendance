from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout, get_user_model
from .forms import CustomUserCreationForm, CustomAuthenticationForm, UpdateUsernameForm, UpdatePhotoForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('profile')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form})


def connect(request):
    return render(request, 'connect.html')

def home(request):
    return render(request, 'home.html')

def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = CustomAuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('connect')

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
def add_friend(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        try:
            friend = User.objects.get(username=username)
            if friend == request.user:
                messages.error(request, "Vous ne pouvez pas vous ajouter vous-même comme ami.")
            elif friend in request.user.friend_list.all():
                messages.error(request, "Cet utilisateur est déjà votre ami.")
            else:
                request.user.friend_list.add(friend)
                messages.success(request, f"{friend.username} a été ajouté à votre liste d'amis.")
        except User.DoesNotExist:
            messages.error(request, "Cet utilisateur n'existe pas.")
        return redirect('friend')
    else:
        return render(request, 'friend.html')
    
@login_required
def user_profile(request, user.id):
    