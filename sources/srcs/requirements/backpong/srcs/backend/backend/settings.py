"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.3.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from datetime import timedelta
import os
import requests
from . import tools
from pathlib import Path
from . import parameters

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: TODO keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-nubwiuho4c4%@3fk9yo54_^#l11s0_+4zl%^$7r3b4-4hknx5_'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [ 'localhost', 'proxy_waf', 'backend', 'frontend' ]

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
	'https://localhost:1443',
	'http://localhost:8000',
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
	'https://localhost:1443',
	'http://localhost:1880',
	'http://localhost:8000',
]

# Application definition

INSTALLED_APPS = [

	'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.sites',
    'django.contrib.staticfiles',

    'corsheaders',
    'rest_framework',
	'rest_framework_simplejwt.token_blacklist',
    'channels',
	
	'ultimapi',
    # 'oauth',
    'oauth',
    'usermanagement',

	# allauth
	'allauth',
    'allauth.account',
    'allauth.headless',
	'allauth.socialaccount',
	'allauth.mfa',
    'allauth.usersessions',

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
	'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

	# Add the account middleware:
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'backend.asgi.application'
WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('POSTGRES_DB'),
#         'USER': os.environ.get('POSTGRES_USER'),
#         'PASSWORD': str(
# 			requests.get("https://vault_c:8200/v1/secret/data/postgres",
# 				verify=os.environ.get('VAULT_CACERT'),
# 				headers={"Authorization": "Bearer " + tools.get_postgres_pass()}).json()["data"]["data"]["password"]
# 		),
#         'HOST': os.environ.get('RESOLVED_PG_HOSTNAME'),
#         'PORT': os.environ.get('POSTGRES_PORT'),
#     }
# }


#a effacer si make des docker
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': str(
			requests.get("https://vault_c:8200/v1/secret/data/postgres",
				verify=os.environ.get('VAULT_CACERT'),
				headers={"Authorization": "Bearer " + tools.get_postgres_pass()}).json()["data"]["data"]["password"]
		),
        'HOST': os.environ.get('RESOLVED_PG_HOSTNAME'),
        'PORT': os.environ.get('POSTGRES_PORT'),
    }
    
    # 'default': {
    #         # 'ENGINE': 'django.db.backends.sqlite3',
    #         # 'NAME': BASE_DIR / 'db.sqlite3',
    #     # 'ENGINE': 'django.db.backends.postgresql',
    #     # 'NAME': os.environ.get('POSTGRES_DB'),
    #     # 'USER': os.environ.get('POSTGRES_USER'),
    #     # 'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
    #     # 'HOST': os.environ.get('RESOLVED_PG_HOSTNAME'),
    #     # 'PORT': os.environ.get('POSTGRES_PORT'),
    # }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = os.environ.get('STATICFILES_DIR')

STATICFILES_DIRS = [
	# BASE_DIR / "static",
]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


##############################
###    One Pong customs    ###
##############################


MEDIA_URL = '/media/'
MEDIA_ROOT = os.environ.get('MEDIA_DIR')


AUTH_USER_MODEL = 'usermanagement.CustomUser'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(str(os.environ.get('REDIS_CONTAINER')), os.environ.get('REDIS_PORT'))],
        },
    },
}

REST_FRAMEWORK = {
	'DEFAULT_AUTHENTICATION_CLASSES': (
		'rest_framework_simplejwt.authentication.JWTAuthentication',
	),
	'DEFAULT_PERMISSION_CLASSES': [
		'rest_framework.permissions.IsAuthenticated',
	],
}
SIMPLE_JWT = {
	"ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=90),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
	# It will work instead of the default serializer(TokenObtainPairSerializer).
	"TOKEN_OBTAIN_SERIALIZER": "oauth.serializers.MyTokenObtainPairSerializer",
	"ACCESS_TOKEN_CLASS": "oauth.tokens.CustomAccessToken",
}


HEADLESS_ONLY = True

MFA_TOTP_ISSUER = 'OnePong'
MFA_SUPPORTED_TYPES = ["totp"]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

EMAIL_HOST = os.getenv('MAIL_CONTAINER')
EMAIL_PORT = os.getenv('MAIL_PORT')

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_USERNAME_REQUIRED = True
# ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = True
SOCIALACCOUNT_ADAPTER = "oauth.adapter.CustomAdapter"
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = True
ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'
# ACCOUNT_REAUTHENTICATION_TIMEOUT = 5000

AUTHENTICATION_BACKENDS = [
	# `allauth` specific authentication methods, such as login by email
    'allauth.account.auth_backends.AuthenticationBackend',

	#default
	'django.contrib.auth.backends.ModelBackend',
]


HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "/frontpong/account/verify-email/?key={key}",
    # "account_reset_password": "/frontpong/account/password/reset",
    # "account_reset_password_from_key": "/frontpong/account/password/reset/key/{key}",
    # "account_signup": "/frontpong/account/signup",
    # "socialaccount_login_error": parameters.CALLBACK_URL,
}


LOGIN_REDIRECT_URL = '/'
LOGIN_URL = '/frontpong/account/login/'
LOGOUT_REDIRECT_URL = '/frontpong/account/login/'

# Provider specific settings
SOCIALACCOUNT_PROVIDERS = {
    'ultimapi': {
        'APP': {
            'client_id': parameters.OAUTH2_CLIENT_ID,
            'secret': parameters.OAUTH2_CLIENT_SECRET,
            'key': ''
        },
		'AUTH_PARAMS': {
			'redirect_uri': parameters.OAUTH2_AUTHORIZATION_REDIRECT_URL,
        },
    }
}

SITE_ID = 1