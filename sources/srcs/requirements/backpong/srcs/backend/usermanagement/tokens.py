import sys
from oauth.tokens import CustomRefreshToken


def customObtainJwtTokenPair(request, user):
	if user:
		refresh = CustomRefreshToken.for_user(user)
		access = str(refresh.access_token)
		if refresh and access:
			jwt_access_token = str(access)
			jwt_refresh_token = str(refresh)
	
			request.session["jwt_access_token"] = jwt_access_token
			request.session["jwt_refresh_token"] = jwt_refresh_token