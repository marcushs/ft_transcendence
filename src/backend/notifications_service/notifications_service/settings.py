"""
Django settings for notifications_service project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
# from . import async_middlewares
import environ
import os

SECRET_KEY = os.environ.get("USER_SECRET_KEY")


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent 


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# /-----> Django key <-----\

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("NOTIFICATIONS_SECRET_KEY")

# /-----> JWT keys && algorithm <-----\

JWT_VERIFYING_KEY = os.environ.get("PUBLIC_JWT_KEY")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM")

# /-----> JWT token lifetime in seconds <-----\

ACCESS_TOKEN_LIFETIME = 120 # 2 minutes
REFRESH_TOKEN_LIFETIME = 86400 # 1 day

# /-----><-----\

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = ['localhost', 'transcendence', '127.0.0.1', 'notifications']
ALLOWED_HOSTS = ['*']


INSTALLED_APPS = [
	'channels',
    'daphne',
	'corsheaders',
    'notifications_app',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
	'corsheaders.middleware.CorsMiddleware',
    'notifications_app.middleware.JWTAuthMiddleware', # Custom middleware for jwt token feature
    'notifications_app.middleware.NotificationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'notifications_service.urls'


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


CHANNEL_LAYERS = {
    'default': {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}


ASGI_APPLICATION = 'notifications_service.asgi.application'

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
    'https://localhost:3000',
]

CSRF_TRUSTED_ORIGINS = [
	'https://localhost:3000',
    'https://10.11.3.2:3000',
]


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('NOTIFICATIONS_DB_NAME'),
        'USER': os.environ.get('NOTIFICATIONS_DB_USER'),
        'PASSWORD': os.environ.get('NOTIFICATIONS_DB_PASSWORD'),
        'HOST': os.environ.get('NOTIFICATIONS_DB_HOST'),
        'PORT': os.environ.get('NOTIFICATIONS_DB_PORT'),
    }
}


AUTH_USER_MODEL = "notifications_app.User"

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
