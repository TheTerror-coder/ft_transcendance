from django.shortcuts import render, redirect
from django.views import debug
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .forms import SignUpForm, LogInForm
from web import variables
from requests_oauthlib import OAuth2Session
from authlib.integrations.django_client import OAuth
# Create your views here.

@login_required(login_url='/login/')
def home(request):
	return (render(request, 'home.html'))
def login(request):
	if (request.user.is_authenticated):
		return (redirect('home'))
	if(request.method == 'POST'):
		form = LogInForm(request.POST)
		username = request.POST.get('username')
		password = request.POST.get('password')
		user = authenticate(request, username=username, password=password)
		if (user is not None):
			auth_login(request, user)
			return (redirect('home'))
		else:
			print ("******user is NONE******")
	else:
		form = LogInForm()
	context = {
		'form' : form
	}
	return (render(request, 'login.html', context))
def logout(request):
	auth_logout(request)
	return (redirect('login'))
def sign_up(request):
	if (request.user.is_authenticated):
		return (redirect('home'))
	if(request.method == 'POST'):
		form = SignUpForm(request.POST)
		if (form.is_valid()):
			form.save()
			username = form.cleaned_data.get('username')
			password = form.cleaned_data.get('password1')
			user = authenticate(request, username=username, password=password)
			if (user is not None):
				auth_login(request, user)
				return (redirect('home'))
		else:
			print('****************form is not valid**************')
	else:
		form = SignUpForm()
	context = {
		'form':form,
	}
	return (render(request, 'sign_up.html', context))

