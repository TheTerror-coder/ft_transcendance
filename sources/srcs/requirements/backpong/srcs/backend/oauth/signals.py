import sys
from allauth.socialaccount.signals import social_account_updated, social_account_added, pre_social_login
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .tokens import CustomRefreshToken
from django.db.models.signals import post_migrate
from django.core.management import call_command

@receiver(social_account_updated)
def issue_jwt_token(sender, request, sociallogin, **kwargs):
	"""
	This signal is fired when a social account is updated or logged in.
	We use it to issue a JWT token for the authenticated user.
	"""
	
	sys.stderr.write("*******DEBUG******* issue_jwt_token() display: " + (sociallogin.user.username or 'null') + '\n')
	user = sociallogin.user
	
	if user:
		refresh = CustomRefreshToken.for_user(user)
		access = str(refresh.access_token)
		if refresh and access:
			jwt_access_token = str(access)
			jwt_refresh_token = str(refresh)

			sys.stderr.write("*******DEBUG******* issue_jwt_token() refresh token: " + jwt_refresh_token + '\n')
			sys.stderr.write("*******DEBUG******* issue_jwt_token() access token: " + jwt_access_token + '\n')
	
			request.session["jwt_access_token"] = jwt_access_token
			request.session["jwt_refresh_token"] = jwt_refresh_token

@receiver(post_migrate)
def create_admin_user(sender, **kwargs):
	call_command('create_admin_user')