import sys
from oauth.tokens import CustomRefreshToken


def customObtainJwtTokenPair(request, user):
	
	sys.stderr.write("*******DEBUG******* customObtainJwtTokenPair() display: " + (user.username or 'null') + '\n')
	
	if user:
		refresh = CustomRefreshToken.for_user(user)
		access = str(refresh.access_token)
		if refresh and access:
			jwt_access_token = str(access)
			jwt_refresh_token = str(refresh)

			sys.stderr.write("*******DEBUG******* customObtainJwtTokenPair() refresh token: " + jwt_refresh_token + '\n')
			sys.stderr.write("*******DEBUG******* customObtainJwtTokenPair() access token: " + jwt_access_token + '\n')
	
			request.session["jwt_access_token"] = jwt_access_token
			request.session["jwt_refresh_token"] = jwt_refresh_token