from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from ..utils.jwt_utils import get_user_from_jwt_sync
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.core.serializers import serialize
import json
from django.db.models import Q


User = get_user_model()

class getChatroomUnreadMessagesCountView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		chatroom_id = request.GET.get('chatroomId')
		user = request.user

		try: 
			chatroom = get_object_or_404(ChatGroup, group_id=chatroom_id)
			unread_count = GroupMessage.objects.filter(
							Q(group_id=chatroom_id) &  # Filter by chatroom
							Q(read=False) &            # Only unread messages
							~Q(author=user.id) # Exclude messages authored by the requesting user
							).count()
			return JsonResponse({'unreadCount': unread_count, 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Requested chatroom does not exist', 'status': 'Error'}, status=401)