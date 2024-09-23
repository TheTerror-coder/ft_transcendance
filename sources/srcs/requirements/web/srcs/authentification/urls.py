from django.urls import path
from . import views

urlpatterns = [
    path('', views.connect, name='base'),
    path('home/', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    # path('connect/', views.connect, name='connect'),
    path('profile/', views.profile, name='profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('update-photo/', views.update_photo, name='update_photo'),
    path('friend/', views.friend, name='friend'),
    path('add_friend/', views.send_friend_request, name='add_friend'),
    path('remove_friend/', views.remove_friend, name='remove_friend'),
    path('user/<str:username>', views.users, name='user'),
]