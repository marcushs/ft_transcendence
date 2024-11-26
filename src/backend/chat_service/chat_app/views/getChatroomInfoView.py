from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.http import Http404
from ..utils.request import send_request_with_token
from django.core.exceptions import ValidationError

User = get_user_model()

class getChatroomInfoView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			chatroom_id = request.GET.get('chatroom_id')


			chatroom = get_object_or_404(ChatGroup, group_id=str(chatroom_id))
			members_list = list(chatroom.members.all())
			members = []
			for member in members_list:
				try:
					response = send_request_with_token(request_type='GET', request=request, url=f'http://user:8000/api/user/get_user_by_id/?q={member.id}')
					user_data = response.json()['user_data']
					if not 'profile_image' in user_data or not 'profile_image_link':
						raise ValidationError('missingData')
					user_dict = {
						'id': member.id, 
						'username': member.username,
						'profile_image': user_data['profile_image'] if user_data['profile_image'] else user_data['profile_image_link'],
						'status': user_data['status']
					}
					members.append(user_dict)
				except Exception as e:
					print(f'Error: {str(e)}')
					return JsonResponse({'message': str(e)}, status=502)
			chatroom_dict = {
				'id': chatroom.group_id,
				'members': members
			}
			return JsonResponse({'chatroom_dict': chatroom_dict, 'status': 'Success'}, status=200)
		except ValidationError as e:
			return JsonResponse({'message': str(e)}, status=400)
		except Http404 as e:
			return JsonResponse({'message': str(e), 'status': 'Error'}, status=404)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=502) 

