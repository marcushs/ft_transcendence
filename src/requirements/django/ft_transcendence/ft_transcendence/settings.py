"""
Django settings for ft_transcendence project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import environ
import os
import datetime

# Read from .env file
env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent 


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env("SECRET_KEY")

    # /--> JWT <--\
JWT_SECRET_KEY = 'aR[G~vTMe,qRP;)+`2x`gv3#IZ@&f!*f'
JWT_ALGORITHM = 'HS256' # HMAC with SHA-256
JWT_EXP_DELTA_SECONDS = 3000 # 15 minutes
JWT_REFRESH_EXP_DELTA_SECONDS = 6000 # 1day
    # /--> 2FA <--\
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'kingpong.info@gmail.com'
EMAIL_HOST_PASSWORD = 'mlxe bkoa gjue tigk'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', 'transcendence', '127.0.0.1']

# Application definition

INSTALLED_APPS = [
	"corsheaders",
	'account',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 2FA
    'django_otp',
    'django_otp.plugins.otp_static',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_email',  # <- for email capability.
    'two_factor',
    'two_factor.plugins.phonenumber',  # <- for phone number capability.
    'two_factor.plugins.email',  # <- for email capability.
    # 'two_factor.plugins.yubikey',  # <- for yubikey capability.
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
	'corsheaders.middleware.CorsMiddleware',
    'django_otp.middleware.OTPMiddleware', # Base middleware for two_factor feature
    'account.auth.middleware.JWTAuthenticationMiddleware', # Custom middleware for jwt token feature
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'ft_transcendence.urls'


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


WSGI_APPLICATION = 'ft_transcendence.wsgi.application'


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
	'http://frontend'
]

CSRF_TRUSTED_ORIGINS = [
	'http://localhost:3000',
	'http://frontend'
]

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}

LOGIN_URL = 'two_factor:login'
AUTH_USER_MODEL = "account.User"

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-pa   ssword-validators

AUTH_PASSWORD_VALIDATORS = [
    # check similarity with email and username
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', 
    },
    # setup min length password
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    # check low password strength
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    # check password contains only numeric char
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'account.auth.signup.NumericValidator',
    },
    # check password contains uppercase char
    {
        'NAME': 'account.auth.signup.UppercaseValidator',
    },
    # check password contains lowercase char
    {
        'NAME': 'account.auth.signup.LowercaseValidator',
    },
]


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
