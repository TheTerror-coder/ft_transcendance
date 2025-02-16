import sys
from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
	@classmethod
	def for_user(cls, user):
		token = super().for_user(user)
		token['username'] = user.username if user.username else None
		token['firstname'] = user.first_name if user.first_name else None
		token['lastname'] = user.last_name if user.last_name else None
		token['email'] = user.email if user.email else None
		return token
