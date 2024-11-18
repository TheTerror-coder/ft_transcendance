from allauth.socialaccount import app_settings
from allauth.socialaccount.adapter import get_adapter
from allauth.socialaccount.providers.oauth2.views import (
	OAuth2Adapter,
	OAuth2CallbackView,
	OAuth2LoginView,
)

from backend import parameters


class UltimApiOAuth2Adapter(OAuth2Adapter):
	provider_id = "ultimapi"
	settings = app_settings.PROVIDERS.get(provider_id, {})
	
	api_url = parameters.OAUTH2_BASE_URL

	access_token_url = parameters.OAUTH2_ACCESS_TOKEN_URL
	authorize_url = parameters.OAUTH2_AUTHORIZE_URL
	profile_url = parameters.OAUTH2_PROFILE_URL

	def complete_login(self, request, app, token, **kwargs):
		headers = {"Authorization": "Bearer {}".format(token.token)}
		resp = (
			get_adapter().get_requests_session().get(self.profile_url, headers=headers)
		)
		resp.raise_for_status()
		extra_data = resp.json()
		return self.get_provider().sociallogin_from_response(request, extra_data)


oauth2_login = OAuth2LoginView.adapter_view(UltimApiOAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(UltimApiOAuth2Adapter)
