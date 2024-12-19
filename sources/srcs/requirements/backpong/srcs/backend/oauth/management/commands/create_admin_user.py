from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.parameters import EnvVariables
import requests

class Command(BaseCommand):
    help = 'Creates a superuser if one does not exist'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Check if the superuser already exists
        if not User.objects.filter(username='pongadmin').exists():
            User.objects.create_superuser(
			username = 'pongadmin',
			email = 'pongadmin@onepong.tr',
			password = str(
				requests.get(f"https://vault_c:{EnvVariables.VAULT_API_PORT}/v1/secret/data/backpong_admin",
					verify=EnvVariables.VAULT_CACERT,
					headers={"Authorization": "Bearer " + EnvVariables.SECRET_ACCESS_TOKEN}).json()["data"]["data"]["password"]
			)
			)
            self.stderr.write(self.style.SUCCESS('Superuser created successfully'))
        else:
            self.stderr.write(self.style.SUCCESS('Superuser already exists'))