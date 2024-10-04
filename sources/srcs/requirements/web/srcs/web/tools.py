import os

def get_postgres_pass():
	with open(str(os.environ.get('WEB_HOME')) + '/secrets/secret_access_token') as file:
		return str(file.read())
	return 'null'