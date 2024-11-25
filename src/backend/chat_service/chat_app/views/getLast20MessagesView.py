from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core.serializers import serialize
import json
from django.utils import timezone
from django.http import Http404
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class getLast20MessagesView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			chatroom_id = request.GET.get('chatroomId')
			user = request.user

			if not chatroom_id:
					return JsonResponse({'message': 'chatroomId is required', 'status': 'Error'}, status=400)
			
			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=401)

			try:
				chatroom = get_object_or_404(ChatGroup, group_id=str(chatroom_id))
			except ValidationError as e:
				return JsonResponse({'message': str(e), 'status': 'Error'}, status=400)
			except Http404 as e:
				return JsonResponse({'message': str(e), 'status': 'Error'}, status=404)
			
			# Get blocked users and their block times
			blocks = Block.objects.filter(blocker=user)
			blocked_users = {str(block.blocked.id): block.created_at for block in blocks}

			recent_messages = GroupMessage.objects.filter(group=chatroom).order_by('-created')

			filtered_messages = []
			for message in recent_messages:
				if str(message.author.id) in blocked_users: 
					# If the message is from a blocked user, check if it was sent before the block
					if message.created < blocked_users[str(message.author.id)]: 
						filtered_messages.append(message)
				else:
					filtered_messages.append(message)
				
				if len(filtered_messages) == 20: 
					break
			# Serialize the QuerySet to JSON 
			serialized_messages = serialize('json', filtered_messages) 
		
			# Parse the JSON string back to a Python object
			last_20_messages = json.loads(serialized_messages)

			return JsonResponse({'last20Messages': last_20_messages, 'status': 'Success'}, status=200)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=500)
