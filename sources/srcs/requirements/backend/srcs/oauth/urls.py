from django.urls import path
from . import views

urlpatterns = [
    # path('is_authenticated/', views.getIsAuthenticated, name='oauth_isAuthenticated'),
    path('profile/', views.getUserProfile, name='oauth_isAuthenticated'),
    path('qr/generate-totp-qrcode/', views.generateTotpQrCode, name='generate_totp_qrcode'),
    path('auth/session/', views.CustomSessionView.as_api_view(client='browser'), name='current_session'),
    # path('jwt/token/', views.jwtToken, name='jwt_token'),
]