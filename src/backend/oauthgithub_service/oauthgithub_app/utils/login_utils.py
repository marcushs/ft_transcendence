# --- SRC --- #
from django.http import JsonResponse
from ..models import User
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

# --- UTILS --- #
import environ
import os
from ..utils.jwt_utils import create_jwt_token
from .send_request import send_request_with_token, send_request_without_token

User = get_user_model()

env = environ.Env()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

def login(user, request, payload, csrf_token):
	if user.two_factor_method != '':
		return _send_twofactor_request(user=user, payload=payload, csrf_token=csrf_token, request=request)
	if request.COOKIES.get('jwt'):
		response = JsonResponse({'message': 'You are already logged in'}, status=400)
		response.delete_cookie('github_access_token')
		return response
	try:
		if user.is_verified is True:
			response = JsonResponse({'message': '2FA activated on this account, need to verify before log', 'is_verified': user.is_verified}, status=200)
			response.delete_cookie('github_access_token')
			return response
		response = _create_user_session(user=user, request=request)
	except User.DoesNotExist:
		response = JsonResponse({'message': 'Invalid username, please try again'}, status=400)
	response.delete_cookie('github_access_token')
	return response

def _create_user_session(user, request):
	token = create_jwt_token(user, 'access')
	refresh_token = create_jwt_token(user, 'refresh') 
	response = JsonResponse({'message': 'Login successfully'}, status=200)
	response.set_cookie('jwt', token, httponly=True, max_age=settings.ACCESS_TOKEN_LIFETIME)
	response.set_cookie('jwt_refresh', refresh_token, httponly=True, max_age=settings.REFRESH_TOKEN_LIFETIME)
	response.delete_cookie('github_access_token')
	request.jwt = token
	request.jwt_refresh = refresh_token
	payload = {
		'status': 'online',
		'last_active': '',
	}
	try:
		send_request_with_token(request_type='POST', request=request, url='http://user:8000/api/user/update_user/', jwt_token=token, jwt_refresh_token=refresh_token, payload=payload)
		return response 
	except Exception as e:
		return JsonResponse({'message': 'An error occured while logging in'}, status=502)

def _send_twofactor_request(user, payload, csrf_token, request):
	try:
		response = send_request_without_token(request_type='POST', url='http://twofactor:8000/api/twofactor/twofactor_login/', payload=payload, csrf_token=csrf_token)
		response.delete_cookie('github_access_token')
		if response.status_code != 200:
			return response
		return _create_user_session(user=user, request=request)
	except ObjectDoesNotExist:
		response = JsonResponse({'error': 'User not found'}, status=404)
		response.delete_cookie('github_access_token')
		return response
	except Exception:
		pass
