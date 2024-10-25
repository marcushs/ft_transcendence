from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core.serializers import serialize
import json

User = get_user_model()

class getLast20MessagesView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		chatroom_id = request.GET.get('chatroomId')

		if not chatroom_id:
				return JsonResponse({'message': 'chatroomId is required', 'status': 'Error'}, status=400)

		try:
			chatroom = get_object_or_404(ChatGroup, group_id=chatroom_id)
		except ValidationError:
			return JsonResponse({'message': 'Invalid chatroomId', 'status': 'Error'}, status=400)

		recent_messages = GroupMessage.objects.filter(group=chatroom).order_by('-created')[:20]
		# Serialize the QuerySet to JSON
		serialized_messages = serialize('json', recent_messages)
    
		# Parse the JSON string back to a Python object
		last_20_messages = json.loads(serialized_messages)

		return JsonResponse({'last20Messages': last_20_messages, 'status': 'Success'}, status=200)
