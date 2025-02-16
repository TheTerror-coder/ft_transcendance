import os

def get_secrets_access_pass():
	return os.environ.get('SECRET_ACCESS_TOKEN')