from django.shortcuts import redirect
from web import variables, wsgi
from requests_oauthlib import OAuth2Session
from authlib.integrations.django_client import OAuth
from web import settings


def user_authorization(request):
	if (request.user.is_authenticated):
		return (redirect('home'))
	ultimapi = settings.oauth.create_client('ultimapi')
	return ultimapi.authorize_redirect(request, variables.OAUTH2_AUTHORIZATION_REDIRECT_URL)

def authorization_callback(request):
	ultimapi = settings.oauth.create_client('ultimapi')
	token = ultimapi.authorize_access_token(request)
	resp = ultimapi.get('v2/me', token=token)
	resp.raise_for_status()
	profile = resp.json()
	print (profile)
	return (redirect('http://localhost'))

# def user_authorization(request):
# 	if (request.user.is_authenticated):
# 		return (redirect('home'))
# 	return (redirect(variables.OAUTH2_AUTHORIZATION_URL))

# def authorization_callback(request):
# 	if (request.method == 'GET'):
# 		code = request.GET.get('code')
# 	else:
# 		print(f"*************************failed to get the access code****************")
# 		return (redirect('login'))
# 	# if variables.oauth is None:
# 	oauth = OAuth2Session(client_id=variables.OAUTH2_CLIENT_ID, redirect_uri=variables.OAUTH2_AUTHORIZATION_REDIRECT_URL)
# 	token = oauth.fetch_token(
# 		'https://api.intra.42.fr/oauth/token', 
# 		code=code, 
# 		client_secret=variables.OAUTH2_CLIENT_SECRET, 
# 		)
	
# 	info = oauth.get('https://api.intra.42.fr/v2/me')
# 	print(f"*************************the code is: {code}****************")
# 	print(f"*************************info: {info.content}****************")
# 	return (redirect('http://localhost'))