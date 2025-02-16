import sys
from allauth.socialaccount.signals import social_account_updated, social_account_added, pre_social_login
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .tokens import CustomRefreshToken
from django.db.models.signals import post_migrate
from django.core.management import call_command
from django.contrib.auth.signals import user_logged_in

@receiver(user_logged_in)
def issue_account_jwt_token(request, user, **kwargs):
	"""
	This signal is fired when a social account is updated or logged in.
	We use it to issue a JWT token for the authenticated user.
	"""
	try:
		if user:
			refresh = CustomRefreshToken.for_user(user)
			access = str(refresh.access_token)
			if refresh and access:
				jwt_access_token = str(access)
				jwt_refresh_token = str(refresh)

				request.session["jwt_access_token"] = jwt_access_token
				request.session["jwt_refresh_token"] = jwt_refresh_token
	except Exception as e:
		return None

@receiver(post_migrate)
def create_admin_user(sender, **kwargs):
	call_command('create_admin_user')