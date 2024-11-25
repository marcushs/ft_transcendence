from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.contrib.auth.models import AnonymousUser
from ..utils.request import send_request_with_token

User = get_user_model()

class getChatroomsView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user

			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=400)
			chatrooms = user.chat_groups.all()
			chatrooms_data = []
			for chatroom in chatrooms:
				members_list = list(chatroom.members.all())
				members = []
				for member in members_list:
					try:
						response = send_request_with_token(request_type='GET', request=request, url=f'http://user:8000/api/user/get_user_by_id/?q={member.id}')
						user_data = response.json()['user_data']
						user_dict = {
							'id': member.id, 
							'username': member.username,
							'profile_image': user_data['profile_image'] if user_data['profile_image'] else user_data['profile_image_link'],
							'status': user_data['status']
						}
						members.append(user_dict)
					except Exception as e:
						print(f'Error: {str(e)}')
						return JsonResponse({'message': 'Error getting user info'}, status=400)
				chatroom_dict = {
					'id': chatroom.group_id,
					'members': members  # Adjust fields as needed
				}
				chatrooms_data.append(chatroom_dict)
			return JsonResponse({'message': 'Successfully fetch all chatrooms', 'chatrooms': chatrooms_data, 'status': 'Success'}, status=200, safe=False)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=400)
