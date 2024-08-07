"""
URL configuration for web project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib import auth
from django.contrib.auth.views import LoginView
from django.views import debug
from django.urls import include, path
from web import variables
from . import views
from . import oauth2views

urlpatterns = [
    path('', views.home),
    path('home/', views.home, name='home'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('sign_up/', views.sign_up, name='sign_up'),
    path(f'{variables.OAUTH2_AUTHORIZATION_PAGE_URI}/', oauth2views.user_authorization, name='authorization_page'),
    path(f'{variables.OAUTH2_AUTHORIZATION_CALLBACK_URI}/', oauth2views.authorization_callback, name='authorization_callback'),
]
