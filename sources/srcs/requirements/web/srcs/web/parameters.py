#my custom variables


from web import settings
from urllib.parse import urlparse

#########################
### 42 API references ###
#########################
UID = r'u-s4t2ud-6908f20e34d39a7d00ab03ea0e80af2fa75d597bb8660d68e29ecb0344dcb217'
SECRET = r'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'
REDIRECT_URI = r'http://transcendance.fr:8000/accounts/ultimapi/login/callback/'
CONSENT_PAGE = r'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6908f20e34d39a7d00ab03ea0e80af2fa75d597bb8660d68e29ecb0344dcb217&redirect_uri=http%3A%2F%2Ftranscendance.fr%3A8000%2Faccounts%2Fultimapi%2Flogin%2Fcallback%2F&response_type=code'
#########################

OAUTH2_CLIENT_ID = UID
OAUTH2_CLIENT_SECRET = SECRET
OAUTH2_AUTHORIZATION_URL = CONSENT_PAGE
OAUTH2_BASE_URL = r'https://api.intra.42.fr'
OAUTH2_AUTHORIZE_URL = r'https://api.intra.42.fr/oauth/authorize'
OAUTH2_AUTHORIZATION_PAGE_URI = r'FXrMfoog/authorization'
OAUTH2_AUTHORIZATION_REDIRECT_URL = REDIRECT_URI
OAUTH2_AUTHORIZATION_CALLBACK_URI = urlparse(REDIRECT_URI) # e.g Contains the access code needed to fetch a token from the API
OAUTH2_ACCESS_TOKEN_URL = r'https://api.intra.42.fr/oauth/token'
OAUTH2_PROFILE_URL = r'https://api.intra.42.fr/v2/me'
