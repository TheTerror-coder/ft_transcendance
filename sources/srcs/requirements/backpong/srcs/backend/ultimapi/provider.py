from allauth.socialaccount import app_settings
from allauth.socialaccount.providers.base import ProviderAccount
from .views import UltimApiOAuth2Adapter
from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider
import sys

class UltimApiProvider(OAuth2Provider):
	id = "ultimapi"
	name = "UltimApi"
	oauth2_adapter_class = UltimApiOAuth2Adapter
	
	def get_default_scope(self):
		scope = ['public']
		return scope
	
	def extract_uid(self, data):
		return str(data["id"])
	
	def extract_common_fields(self, data):
		try:
			return dict(
				username=data.get("login"),
				first_name=data.get("first_name"),
				last_name=data.get("last_name"),
				email=data.get("email"),
				name=data.get("usual_full_name"),
				image=data.get("image").get("link"),
			)
		except Exception as e:
			return None

	def extract_extra_data(self, data):
		return data


provider_classes = [UltimApiProvider]