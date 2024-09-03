# --- SRC --- #
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

# --- UTILS --- #
import environ
import os
from ..utils.send_post_request import send_post_request
from ..utils.jwt_utils import create_jwt_token

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

def login(user, request, payload, csrf_token):
	if user.two_factor_method != '':
		return _send_twofactor_request(user=user, payload=payload, csrf_token=csrf_token)
	if request.COOKIES.get('jwt'):
		return JsonResponse({'message': 'You are already logged in'}, status=400)
	try:
		if user.is_verified is True:
			return JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified}, status=200)
		response = _create_user_session(user=user)
	except User.DoesNotExist:
		response = JsonResponse({'message': 'Invalid username, please try again'}, status=400) 
	return response

def _create_user_session(user):
	token = create_jwt_token(user, 'access')
	refresh_token = create_jwt_token(user, 'refresh')
	response = JsonResponse({'message': 'Login successfully'}, status=200)
	response.set_cookie('jwt', token, httponly=True, max_age=settings.JWT_EXP_DELTA_SECONDS)
	response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.JWT_REFRESH_EXP_DELTA_SECONDS)
	return response

def _send_twofactor_request(user, payload, csrf_token):
	try:
		response = send_post_request(url='http://twofactor:8000/twofactor/twofactor_login/', payload=payload, csrf_token=csrf_token)
		if response.status_code != 200:
			return response
		return _create_user_session(user=user)
	except ObjectDoesNotExist:
		return JsonResponse({'error': 'User not found'}, status=404)
