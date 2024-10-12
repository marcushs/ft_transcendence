from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from ..utils.jwt_utils import get_user_from_jwt_sync

User = get_user_model()

class getChatroomsView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		jwt_token = request.COOKIES.get('jwt')

		if jwt_token:
			user = get_user_from_jwt_sync(jwt_token)
			if user and user is not 'expired':
				query_set = ChatGroup.objects.filter(members=str(user.id))
				chatrooms = list(query_set.values())
				return JsonResponse({'message': 'Successfully fetch all chatrooms', 'chatrooms': chatrooms, 'status': 'Success'}, status=200, safe=False)
		else:
			return JsonResponse({'message': 'Cannot parse jwt', 'status': 'Error'}, status=401)
