import os
import requests
from .parameters import EnvVariables

def get_secrets_access_pass():
	return os.environ.get('SECRET_ACCESS_TOKEN')

def get_redisUserPassword():
	return str(
		requests.get(f"https://vault_c:{EnvVariables.VAULT_API_PORT}/v1/secret/data/redis_onepong", 
			   verify=os.environ.get('VAULT_CACERT'), 
			   headers={"Authorization": "Bearer " + get_secrets_access_pass()}).json()["data"]["data"]["password"]
	)

def get_RedisBackendUri():
	_host 			=f"{EnvVariables.REDIS_CONTAINER}"
	_port 			=f"{EnvVariables.REDIS_PORT}"
	_username 		=f"{EnvVariables.REDIS_USER}"
	_password 		=get_redisUserPassword()
	_ssl_ca_certs 	=f"{EnvVariables.BACKEND_ROOT_CA}"

	address = f"rediss://{_username}:{_password}@{_host}:{_port}?ssl_ca_certs={_ssl_ca_certs}"

	return address