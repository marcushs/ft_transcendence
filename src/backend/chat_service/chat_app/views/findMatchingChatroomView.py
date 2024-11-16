from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q

User = get_user_model()

class findMatchingChatroomView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		author = request.user.id
		target_user = request.GET.get('targetUserId')

		if isinstance(author, AnonymousUser):
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=400)
		try: 
			chatroom = ChatGroup.objects.filter(
				is_private=True,
				members=author
			).filter(
				members=target_user
			).get()
			return JsonResponse({'chatroom_id': chatroom.group_id, 'status': 'Success'}, status=200)
		except ChatGroup.DoesNotExist:
			return JsonResponse({'message': 'No matching chatroom for these users', 'status': 'Success'}, status=200)
