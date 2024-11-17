from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.core.serializers import serialize
import json

User = get_user_model()

class getChatroomLastMessageView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		chatroom_id = request.GET.get('chatroomId')

		try: 
			chatroom = get_object_or_404(ChatGroup, group_id=chatroom_id)
			last_message = GroupMessage.objects.filter(group=chatroom).order_by('-created')[:1]
			serialized_message = serialize('json', last_message)
			return_message = json.loads(serialized_message)

			return JsonResponse({'lastMessage': return_message, 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Requested chatroom does not exist', 'status': 'Error'}, status=401)
