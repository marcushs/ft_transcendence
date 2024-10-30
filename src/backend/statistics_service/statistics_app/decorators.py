from django.http import JsonResponse
from .request import send_request
from django.conf import settings
from functools import wraps
import jwt

 #//---------------------------------------> JWT decorator <--------------------------------------\\#

def jwt_required(initial_function):
    @wraps(initial_function)
    async def wrapper(request, *args, **kwargs):
        try:
            user_id = await decode_jwt_token(request)
            response = await initial_function(request, user_id)
            return update_jwt_cookies(request=request, response=response)
        except ValueError as e: 
            print(f'ValueError: jwt: {str(e)}')
            return JsonResponse({'message': str(e)}, status=401)
        except Exception as e:
            print(f'ExceptionError: jwt: {str(e)}')
            return send_jwt_failed_response()
    return wrapper

async def decode_jwt_token(request): 
    token = request.COOKIES.get('jwt')  
    if not token:
        raise ValueError("JWT token is missing in cookies")
    if not isinstance(token, bytes):
        token = token.encode('utf-8')
    try:
        print(f'token: {token} -- typeof : {type(token)}')
        payload = jwt.decode(token, settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM]) 
        return str(payload['user_id'])
    except jwt.ExpiredSignatureError:
        response_request = await send_request(request_type='GET',request=request, url='http://auth:8000/api/auth/update-tokens/')
        request.new_token = response_request.cookies.get('jwt')
        request.new_token_refresh =  response_request.cookies.get('jwt_refresh')
        print(f'request.new_token: {request.new_token} -- typeof : {type(request.new_token)}')
        payload = jwt.decode(request.new_token.encode('utf-8'), settings.JWT_VERIFYING_KEY,  algorithms=[settings.JWT_ALGORITHM])
        return str(payload['user_id'])

def send_jwt_failed_response():  
    response = JsonResponse({'message': 'invalid session token'}, status=401)
    response.delete_cookie('jwt')
    response.delete_cookie('jwt_refresh')
    return response


def update_jwt_cookies(request, response):
    if hasattr(request, 'new_token'):
        response.set_cookie('jwt', request.new_token, httponly=True, max_age=settings.ACCESS_TOKEN_LIFETIME)
    if hasattr(request, 'new_token_refresh'):
        response.set_cookie('jwt_refresh', request.new_token_refresh, httponly=True, max_age=settings.REFRESH_TOKEN_LIFETIME)
    return response

 #//---------------------------------------><--------------------------------------\\#