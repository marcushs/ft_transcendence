"""
Django settings for friends_service project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import os

# Read from .env file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Path for files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Build paths inside the project like this: BASE_DIR / 'subdir'. 
BASE_DIR = Path(__file__).resolve().parent.parent 


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# /-----> Django key <-----\

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("AUTH_SECRET_KEY")

# /-----> JWT keys && algorithm <-----\

JWT_VERIFYING_KEY = os.environ.get("PUBLIC_JWT_KEY")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM")

# /-----> JWT token lifetime in seconds <-----\

ACCESS_TOKEN_LIFETIME = 120 # 2 minutes
REFRESH_TOKEN_LIFETIME = 86400 # 1 day

# /-----><-----\

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True 

ALLOWED_HOSTS = ['localhost', 'transcendence', '127.0.0.1', 'friends']

# Application definition
 
INSTALLED_APPS = [
    'channels',
    'daphne',
	'corsheaders',
    'friends_app',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles'
]


MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'friends_app.middleware.JWTAuthMiddleware', # Custom middleware for jwt token feature
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',   
] 


ROOT_URLCONF = 'friends_service.urls'


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

ASGI_APPLICATION = 'friends_service.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
        },
    },
}

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_HEADER = [
	"accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
	'http://frontend',
	'http://friends'
]

CSRF_TRUSTED_ORIGINS = [
	'http://localhost:3000',
	'http://frontend',
	'http://friends'
]

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('FRIENDS_DB_NAME'),
        'USER': os.environ.get('FRIENDS_DB_USER'),
        'PASSWORD': os.environ.get('FRIENDS_DB_PASSWORD'),
        'HOST': os.environ.get('FRIENDS_DB_HOST'),
        'PORT': os.environ.get('FRIENDS_DB_PORT'),
    }
}

AUTH_USER_MODEL = "friends_app.User"


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'  
