import sys
from allauth.socialaccount.signals import social_account_updated, social_account_added, pre_social_login
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .tokens import CustomRefreshToken

@receiver(social_account_added)
@receiver(social_account_updated)
def issue_jwt_token(sender, request, sociallogin, **kwargs):
	"""
	This signal is fired when a social account is updated or logged in.
	We use it to issue a JWT token for the authenticated user.
	"""
	sys.stderr.write("*******DEBUG******* display: " + sociallogin.user.username + '\n')
	user = sociallogin.user
	refresh = CustomRefreshToken.for_user(user)
	access = str(refresh.access_token)
	jwt_access_token = str(access)
	jwt_refresh_token = str(refresh)
	sys.stderr.write("*******DEBUG******* refresh token: " + jwt_refresh_token + '\n')
	sys.stderr.write("*******DEBUG******* access token: " + jwt_access_token + '\n')
	
	request.session["jwt_access_token"] = jwt_access_token
	request.session["jwt_refresh_token"] = jwt_refresh_token