import sys
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_field
from .tokens import CustomRefreshToken

class CustomAdapter(DefaultSocialAccountAdapter):
	def save_user(self, request, sociallogin, form=None):
		user = super().save_user(request, sociallogin, form)

		if user:
			refresh = CustomRefreshToken.for_user(user)
			access = str(refresh.access_token)
			if refresh and access:
				jwt_access_token = str(access)
				jwt_refresh_token = str(refresh)
				sys.stderr.write("*******DEBUG******* refresh token: " + jwt_refresh_token + '\n')
				sys.stderr.write("*******DEBUG******* access token: " + jwt_access_token + '\n')

				request.session["jwt_access_token"] = jwt_access_token
				request.session["jwt_refresh_token"] = jwt_refresh_token
		print("*******DEBUG******* CustomAdapter user: " + str(user), file=sys.stderr)
		return user
	
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
		print("*************DEBUG*********** populate_user()", file=sys.stderr)
		user = super().populate_user(request, sociallogin, data)
		print("*************DEBUG*********** user: " + str(user), file=sys.stderr)
		photo_link = data.get("image")
		user_field(user, "photo_link", photo_link)
		print("*************DEBUG*********** photo_link: " + str(photo_link), file=sys.stderr)
		return user