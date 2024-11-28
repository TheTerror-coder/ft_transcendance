import sys
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
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