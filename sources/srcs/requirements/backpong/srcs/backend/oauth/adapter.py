import sys
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_field
from .tokens import CustomRefreshToken

class CustomAdapter(DefaultSocialAccountAdapter):
	def save_user(self, request, sociallogin, form=None):
		try:
			user = super().save_user(request, sociallogin, form)

			if user:
				refresh = CustomRefreshToken.for_user(user)
				access = str(refresh.access_token)
				if refresh and access:
					jwt_access_token = str(access)
					jwt_refresh_token = str(refresh)

					request.session["jwt_access_token"] = jwt_access_token
					request.session["jwt_refresh_token"] = jwt_refresh_token
			return user
		except Exception as e:
			return None
	
	def populate_user(self, request, sociallogin, data):
		"""
		Hook that can be used to further populate the user instance.

		For convenience, we populate several common fields.

		Note that the user instance being populated represents a
		suggested User instance that represents the social user that is
		in the process of being logged in.

		The User instance need not be completely valid and conflict
		free. For example, verifying whether or not the username
		already exists, is not a responsibility.
		"""
		try:
			user = super().populate_user(request, sociallogin, data)
			photo_link = data.get("image")
			user_field(user, "photo_link", photo_link)
			return user
		except Exception as e:
			return None