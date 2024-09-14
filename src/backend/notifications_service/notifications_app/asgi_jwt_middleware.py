import jwt
from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.http import parse_cookie


User = get_user_model()

async def get_user_from_jwt(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY,  algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get('user_id')
        user = await sync_to_async(User.objects.get)(id=user_id)
        return user
    except Exception as e:
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        instance = JWTAuthMiddlewareInstance(scope, receive, send, self.inner)
        return await instance()


class JWTAuthMiddlewareInstance:
    def __init__(self, scope, receive, send, inner):
        self.scope = scope
        self.receive = receive
        self.send = send
        self.inner = inner

    async def __call__(self):
        headers = dict(self.scope["headers"])
        cookies = parse_cookie(headers.get(b'cookie', b'').decode())
        jwt_token = cookies.get('jwt')
        
        if jwt_token:
            user = await get_user_from_jwt(jwt_token)
            self.scope['user'] = user
        else:
            self.scope['user'] = AnonymousUser()

        return await self.inner(self.scope, self.receive, self.send)
    