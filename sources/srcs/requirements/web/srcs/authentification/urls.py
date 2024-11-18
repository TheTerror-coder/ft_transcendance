from django.urls import path
from . import views

urlpatterns = [
    # path('', views.connect, name='base'),
    path('homePage/', views.connect, name='homePage'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('update-photo/', views.update_photo, name='update_photo'),
    path('add_friend/', views.send_friend_request, name='add_friend'),
    path('remove_friend/', views.remove_friend, name='remove_friend'),
    path('profile/', views.profile, name='profile'),
    path('login/', views.login_view, name='login'),
    path('user/<str:username>', views.users, name='user'),
]