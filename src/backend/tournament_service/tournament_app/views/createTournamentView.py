from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class createTournamentView(View):
	def __init__(self):
		super().__init__

	def post(self, request):
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
