from django.urls import path
from . import views

urlpatterns = [
    path('', views.connect, name='base'),
    path('test/', views.test),
    path('homePage/', views.connect, name='homePage'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('update-photo/', views.update_photo, name='update_photo'),
    path('add-friend/', views.send_friend_request, name='add_friend'),
    path('remove-friend/', views.remove_friend, name='remove_friend'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.login_view, name='login'),
    path('users', views.users, name='user'),
]