from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from ..utils.jwt_utils import get_user_from_jwt_sync
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class getChatroomsView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		user = request.user

		if isinstance(user, AnonymousUser):
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=400)
		chatrooms = user.chat_groups.all()
		chatrooms_data = []
		for chatroom in chatrooms:
			chatroom_dict = {
				'id': chatroom.group_id,
				'members': list(chatroom.members.all().values('id', 'username', 'profile_image', 'profile_image_link'))  # Adjust fields as needed
			}
			chatrooms_data.append(chatroom_dict)
		return JsonResponse({'message': 'Successfully fetch all chatrooms', 'chatrooms': chatrooms_data, 'status': 'Success'}, status=200, safe=False)
