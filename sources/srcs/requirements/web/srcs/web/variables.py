#my custom variables


from web import settings


OAUTH2_CLIENT_ID = r'u-s4t2ud-6908f20e34d39a7d00ab03ea0e80af2fa75d597bb8660d68e29ecb0344dcb217'
OAUTH2_CLIENT_SECRET = r'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'
OAUTH2_BASE_URL = r'https://api.intra.42.fr'
OAUTH2_AUTHORIZE_URL = r'https://api.intra.42.fr/oauth/authorize'
OAUTH2_AUTHORIZATION_URL = r'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6908f20e34d39a7d00ab03ea0e80af2fa75d597bb8660d68e29ecb0344dcb217&redirect_uri=http%3A%2F%2Ftranscendance.fr%3A8000%2FrdDF3aPi%2Fauthorize&response_type=code'
OAUTH2_AUTHORIZATION_PAGE_URI = r'FXrMfoog/authorization' # e.g Contains the access code needed to fetch a token from the API
OAUTH2_AUTHORIZATION_CALLBACK_URI = r'rdDF3aPi/authorize' # e.g Contains the access code needed to fetch a token from the API
OAUTH2_AUTHORIZATION_REDIRECT_URL = rf'http://transcendance.fr:8000/{OAUTH2_AUTHORIZATION_CALLBACK_URI}'
OAUTH2_ACCESS_TOKEN_URL = r'https://api.intra.42.fr/oauth/token'
oauth = None
oauth_token = None
