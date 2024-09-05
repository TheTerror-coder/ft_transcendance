
def get_postgres_pass():
	with open('/run/secrets/secret_access_token') as file:
		return str(file.read())
	return 'null'