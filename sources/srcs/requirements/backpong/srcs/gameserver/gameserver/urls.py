"""
URL configuration for gameserver project.

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
from django.shortcuts import redirect
from django.urls import path, include, re_path
from . import views

urlpatterns = [
    path('', views.healthcheck, name="healthcheck"),
    path('healthcheck/', views.healthcheck, name="healthcheck"),
    path('backgame/health/', views.test, name="healthcheck"),
    path('admin/', admin.site.urls),
    path('backgame/', include('backgame.urls')),

	re_path(r'^backgame/.*$', lambda request: redirect('/error-404/', permanent=True)),
	re_path(r'^gameserver/.*$', lambda request: redirect('/error-404/', permanent=True)),
	re_path(r'^socket.io/.*$', lambda request: redirect('/error-404/', permanent=True)),

]
