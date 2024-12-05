from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class blockUserView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user
			blocked_user_id = request.GET.get('blockedUserId', None)
			if blocked_user_id is None:
				return JsonResponse({'message': 'No blocked user id provided', 'status': 'error'}, status=400)
			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=401)
			try:
				blocked_user = get_object_or_404(User, id=str(blocked_user_id))
				if blocked_user == user:
					return JsonResponse({'message': 'User and blocked user are identical', 'status': 'Error'}, status=401)
				user.block_user(blocked_user)
				return JsonResponse({'message': f'User {str(blocked_user_id)} has been blocked', 'status': 'Success'}, status=200)
			except Http404:
				return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=500)
		
class unblockUserView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user
			blocked_user_id = request.GET.get('blockedUserId', None)
			if blocked_user_id is None:
				return JsonResponse({'message': 'No blocked user id provided', 'status': 'error'}, status=400)

			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=401)
			try:
				blocked_user = get_object_or_404(User, id=str(blocked_user_id))
				if blocked_user == user:
					return JsonResponse({'message': 'User and blocked user are identical', 'status': 'Error'}, status=400)
				user.unblock_user(blocked_user_id)
				return JsonResponse({'message': f'User {str(blocked_user_id)} has been unblocked', 'status': 'Success'}, status=200)
			except Http404:
				return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=500)
		
class isUserBlockedView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			user = request.user
			target_user_id = request.GET.get('targetUserId', None)
			if target_user_id is None:
				return JsonResponse({'message': 'No target user id provided', 'status': 'error'}, status=400)

			if isinstance(user, AnonymousUser):
				return JsonResponse({'message': 'No user found', 'status': 'error'}, status=401)
			
			try:
				target_user = get_object_or_404(User, id=str(target_user_id))
				is_blocked = user.is_blocking(target_user)
				return JsonResponse({'message': f'{is_blocked}', 'status': 'Success'}, status=200)
			except Http404:
				return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=500)


