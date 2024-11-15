#my custom variables


from web import settings
from urllib.parse import urlparse

#########################
### 42 API references ###
#########################
UID = r'u-s4t2ud-6908f20e34d39a7d00ab03ea0e80af2fa75d597bb8660d68e29ecb0344dcb217'
SECRET = r'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'
REDIRECT_URI = r'https://localhost:14443/accounts/ultimapi/login/callback/'
#########################

OAUTH2_CLIENT_ID = UID
OAUTH2_CLIENT_SECRET = SECRET
OAUTH2_BASE_URL = r'https://api.intra.42.fr'
OAUTH2_AUTHORIZE_URL = r'https://api.intra.42.fr/oauth/authorize'
OAUTH2_AUTHORIZATION_PAGE_URI = r'FXrMfoog/authorization'
OAUTH2_AUTHORIZATION_REDIRECT_URL = REDIRECT_URI
OAUTH2_AUTHORIZATION_CALLBACK_URI = urlparse(REDIRECT_URI) # e.g Contains the access code needed to fetch a token from the API
OAUTH2_ACCESS_TOKEN_URL = r'https://api.intra.42.fr/oauth/token'
OAUTH2_PROFILE_URL = r'https://api.intra.42.fr/v2/me'

PROXY_HOST = 'https://localhost:14443'
CALLBACK_URL = PROXY_HOST + '/oauth/profile/'