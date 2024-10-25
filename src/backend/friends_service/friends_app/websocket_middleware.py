import jwt
from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.http import parse_cookie
from .utils.jwt_utils import get_user_from_jwt

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        print(f'scope: {scope}')
        print(f'receive: {receive}')
        print(f'send: {send}')
        
        instance = JWTAuthMiddlewareInstance(scope, receive, send, self.inner) 
        return await instance()


class JWTAuthMiddlewareInstance:
    def __init__(self, scope, receive, send, inner):
        self.scope = scope
        self.receive = receive
        self.send = send
        self.inner = inner

    async def __call__(self):
        print(f'scope -----------------------> {self.scope}') 
        headers = dict(self.scope["headers"])
        print(f'header ---------------- > {headers}')
        cookies = parse_cookie(headers.get(b'cookie', b'').decode()) 
        print(f'cookies ---------------- > {cookies}')
        jwt_token = cookies.get('jwt')
        
        print(f'-----> TEST JWT :', jwt_token)
        if jwt_token:
            user = await get_user_from_jwt(jwt_token)  
            if user is not None:
                self.scope['user'] = user
            else:
                self.scope['user'] = AnonymousUser()
        else:
            self.scope['user'] = AnonymousUser()

        return await self.inner(self.scope, self.receive, self.send)
