
import os

#########################
###   ENV VARIABLES   ###
#########################

class EnvVariables:
	SECRET_ACCESS_TOKEN		= os.getenv('SECRET_ACCESS_TOKEN')
	CONTAINER_HOME			= os.getenv('CONTAINER_HOME')
	BACKEND_HOME			= os.getenv('BACKEND_HOME')
	POSTGRES_USER			= os.getenv('POSTGRES_USER')
	POSTGRES_DB				= os.getenv('POSTGRES_DB')
	POSTGRES_PORT			= os.getenv('POSTGRES_PORT')
	RESOLVED_PG_HOSTNAME	= os.getenv('RESOLVED_PG_HOSTNAME')
	STATICFILES_DIR			= os.getenv('STATICFILES_DIR')
	BACKEND_ROOT_CA			= os.getenv('BACKEND_ROOT_CA')
	VAULT_CACERT			= os.getenv('VAULT_CACERT')
	HOST_IP					= os.getenv('HOST_IP')
	BACKEND_PORT			= os.getenv('BACKEND_PORT')
	REDIS_CONTAINER			= os.getenv('REDIS_CONTAINER')
	REDIS_PORT				= os.getenv('REDIS_PORT')
	REDIS_USER				= os.getenv('REDIS_USER')
	REDIS_HOME				= os.getenv('REDIS_HOME')
	MEDIA_DIR				= os.getenv('MEDIA_DIR')
	MAIL_CONTAINER			= os.getenv('MAIL_CONTAINER')
	MAIL_PORT				= os.getenv('MAIL_PORT')
	PROXYWAF_HTTPS_PORT		= os.getenv('PROXYWAF_HTTPS_PORT')
	PROXYWAF_HTTP_PORT		= os.getenv('PROXYWAF_HTTP_PORT')
	VAULT_API_PORT			= os.getenv('VAULT_API_PORT')
	ULTIMAPI_UID			= os.getenv('ULTIMAPI_UID')
	ULTIMAPI_SECRET			= os.getenv('ULTIMAPI_SECRET')
	ULTIMAPI_REDIRECT_URI	= os.getenv('ULTIMAPI_REDIRECT_URI')

#########################
### 42 API references ###
#########################
### default 42 API configured for domain name 'localhost'
class UltimApi:
	UID = EnvVariables.ULTIMAPI_UID
	SECRET = EnvVariables.ULTIMAPI_SECRET
	REDIRECT_URI = EnvVariables.ULTIMAPI_REDIRECT_URI

ULTIMAPI_CLIENT_ID = UltimApi.UID
ULTIMAPI_CLIENT_SECRET = UltimApi.SECRET
ULTIMAPI_AUTHORIZATION_REDIRECT_URL = UltimApi.REDIRECT_URI

OAUTH2_BASE_URL = r'https://api.intra.42.fr'
OAUTH2_AUTHORIZE_URL = r'https://api.intra.42.fr/oauth/authorize'
OAUTH2_ACCESS_TOKEN_URL = r'https://api.intra.42.fr/oauth/token'
OAUTH2_PROFILE_URL = r'https://api.intra.42.fr/v2/me'

PROXY_LOCALHOST_HOST = f'https://localhost:{EnvVariables.PROXYWAF_HTTPS_PORT}'
PROXY_HOST_IP_HOST = f'https://{EnvVariables.HOST_IP}:{EnvVariables.PROXYWAF_HTTPS_PORT}'
