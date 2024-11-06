import jwt
from urllib.parse import parse_qs
from django.conf import settings
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
import urllib.parse
from .utils.jwt_utils import get_user_from_jwt 

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
	async def __call__(self, scope, receive, send):
	# Parse cookies from the headers
		headers = dict(scope['headers'])
		cookie_header = headers.get(b'cookie', b'').decode()
		cookies = self.parse_cookies(cookie_header)

		# Get the JWT token from cookies
		jwt_token = cookies.get('jwt')

		if jwt_token:
			# Decode the JWT
			user = await get_user_from_jwt(jwt_token)
			if user is not None:
				scope['user'] = user
			else:
				scope['user'] = AnonymousUser 
		else:
			print('here??') 
			scope['user'] = AnonymousUser() 
		return await super().__call__(scope, receive, send)
	
	def parse_cookies(self, cookie_header):
		return dict(urllib.parse.parse_qsl(cookie_header.replace('; ', '&')))
