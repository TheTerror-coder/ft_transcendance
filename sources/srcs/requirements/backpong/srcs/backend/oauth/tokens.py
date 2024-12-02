import sys
from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
	# def __init__(self, *args, **kwargs):
	# 	super().__init__(*args, **kwargs)

	# 	# Example of adding custom claims
	# 	sys.stderr.write("************ passed in __init() "+ '\n')
	# 	self['team'] = 'one pong'
	# 	# self['user_role'] = 'admin'  # Add any other claim you want
	
	@classmethod
	def for_user(cls, user):
		# Create a new access token and include custom claims
		token = super().for_user(user)
		sys.stderr.write("*******DEBUG******* passed in for_user() "+ '\n')
		token['username'] = user.username if user.username else None
		token['firstname'] = user.first_name if user.first_name else None
		token['lastname'] = user.last_name if user.last_name else None
		token['email'] = user.email if user.email else None
		return token
