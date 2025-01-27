#my custom variables

import os

#########################
###   ENV VARIABLES   ###
#########################
class EnvVariables:
	SECRET_ACCESS_TOKEN		= os.getenv('SECRET_ACCESS_TOKEN')
	CONTAINER_HOME			= os.getenv('CONTAINER_HOME')
	GAMESERVER_HOME			= os.getenv('GAMESERVER_HOME')
	POSTGRES_USER			= os.getenv('POSTGRES_USER')
	POSTGRES_DB				= os.getenv('POSTGRES_DB')
	POSTGRES_PORT			= os.getenv('POSTGRES_PORT')
	RESOLVED_PG_HOSTNAME	= os.getenv('RESOLVED_PG_HOSTNAME')
	STATICFILES_DIR			= os.getenv('STATICFILES_DIR')
	GAMESERVER_ROOT_CA		= os.getenv('GAMESERVER_ROOT_CA')
	VAULT_CACERT			= os.getenv('VAULT_CACERT')
	HOST_IP					= os.getenv('HOST_IP')
	GAMESERVER_PORT			= os.getenv('GAMESERVER_PORT')
	VAULT_API_PORT			= os.getenv('VAULT_API_PORT')
	PROXYWAF_HTTPS_PORT		= os.getenv('PROXYWAF_HTTPS_PORT')
