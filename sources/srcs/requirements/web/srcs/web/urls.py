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
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    # path('', include('authentification.urls')),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    # path('lobby/pong/', TemplateView.as_view(template_name='pong/index.html')),
    # path('lobby/', TemplateView.as_view(template_name='pong/lobby.html')),
    # path('lobby/lobby1/', TemplateView.as_view(template_name='pong/lobby1.html')),
    # path('lobby/lobby2/', TemplateView.as_view(template_name='pong/lobby2.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)