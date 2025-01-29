from django.urls import path
from . import views

urlpatterns = [
    # path('is_authenticated/', views.getIsAuthenticated, name='oauth_isAuthenticated'),
    path('profile/', views.getUserProfile, name='oauth_isAuthenticated'),
    path('qr/generate-totp-qrcode/', views.generateTotpQrCode, name='generate_totp_qrcode'),
    path('account/jwt/', views.accountJWT.as_api_view(client='browser'), name='account_jwt'),
    # path('jwt/token/', views.jwtToken, name='jwt_token'),
]