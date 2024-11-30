import os

def get_postgres_pass():
	return os.environ.get('SECRET_ACCESS_TOKEN')