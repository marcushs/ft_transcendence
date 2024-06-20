from .jwt_utils import getUserFromJwtToken
from django.http import JsonResponse
from functools import wraps


# View decorator for jwt check token
def check_jwt(view_func):
    @wraps(view_func) # save the original function in the new wrapped function as "view_func"
    def _wrapped_view(request, *args, **kwargs): # manage a variable number of positional arguments (*args) and named arguments (or keywords) (**kwargs)
        token = request.COOKIES.get('jwt')
        if token:
            user = getUserFromJwtToken(token)
            if user:
                request.jwt_user = user # Associates user with the request
                return view_func(request, *args, **kwargs) #  Call the original view with the modified query
            else:
                return JsonResponse({'error': 'Invalid jwt token'}, status=401)
        return JsonResponse({'error': 'Authorization token not provided'}, status=401)
    return _wrapped_view