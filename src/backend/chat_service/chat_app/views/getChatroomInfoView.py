from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404
from django.http import Http404

User = get_user_model()

class getChatroomInfoView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		chatroom_id = request.GET.get('chatroom_id')

		try: 
			chatroom = get_object_or_404(ChatGroup, group_id=chatroom_id)
			chatroom_dict = {
				'id': chatroom.group_id,
				'members': list(chatroom.members.all().values('id', 'username', 'profile_image', 'profile_image_link'))  # Adjust fields as needed
			}

			return JsonResponse({'chatroom_dict': chatroom_dict, 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Requested chatroom does not exist', 'status': 'Error'}, status=401)

