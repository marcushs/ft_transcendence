from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned

User = get_user_model()

class findMatchingChatroomView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			author = request.user.id
			target_user = request.GET.get('targetUserId', None)
			if target_user is None:
				return JsonResponse({'message': 'No target user id provided', 'status': 'error'}, status=400)

			if isinstance(author, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=401)
			try: 
				chatroom = ChatGroup.objects.filter(
					members__in=[author, target_user]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).get()
				return JsonResponse({'chatroom_id': chatroom.group_id, 'status': 'Success'}, status=200)
			except ChatGroup.DoesNotExist:
				return JsonResponse({'message': 'No matching chatroom for these users', 'status': 'Success'}, status=200)
			except MultipleObjectsReturned:
				chatroom = ChatGroup.objects.filter(
					members__in=[author, target_user]
				).annotate(
					num_members=Count('members')
				).filter(
					num_members=2
				).first()
				return JsonResponse({'chatroom_id': chatroom.group_id, 'status': 'Success'}, status=200)
		except ObjectDoesNotExist as e:
			return JsonResponse({"message": str(e)}, status=404)
		except Exception as e:
			return JsonResponse({"message": str(e)}, status=500)
