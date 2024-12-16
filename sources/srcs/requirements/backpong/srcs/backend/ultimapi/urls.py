from allauth.socialaccount.providers.oauth2.urls import default_urlpatterns

from .provider import UltimApiProvider


urlpatterns = default_urlpatterns(UltimApiProvider)
