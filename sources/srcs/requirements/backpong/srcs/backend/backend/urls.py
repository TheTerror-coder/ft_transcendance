"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.urls import path, include
from django.conf import settings
from . import health, views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    
	####################################
	###    Django default URLs       ###
	####################################
    path('admin/', admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),


	####################################
	### ONE PONG Backend CUSTOM URLs ###
	####################################
	path('backpong/healthcheck/', health.healthcheck, name='csrf'),
	path('backpong/csrf/', views.csrf, name='csrf'),
	path('backpong/user-management/', include('usermanagement.urls')),
    path('backpong/oauth/', include('oauth.urls')),
    path('backpong/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('backpong/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
