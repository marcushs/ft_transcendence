from django.views import View
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from ..models import *
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Q

User = get_user_model()

class blockUserView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		user = request.user
		blocked_user_id = request.GET.get('blockedUserId')

		if isinstance(user, AnonymousUser):
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=404)
		try:
			blocked_user = get_object_or_404(User, id=blocked_user_id)
			user.blocked_users.add(blocked_user_id)
			if blocked_user == user:
				return JsonResponse({'message': 'User and blocked user are identical', 'status': 'Error'}, status=401)
			return JsonResponse({'message': f'User {blocked_user_id} has been blocked', 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)
		
class unblockUserView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		user = request.user
		blocked_user_id = request.GET.get('blockedUserId')

		if isinstance(user, AnonymousUser):
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=404)
		try:
			blocked_user = get_object_or_404(User, id=blocked_user_id)
			user.blocked_users.remove(blocked_user_id)
			if blocked_user == user:
				return JsonResponse({'message': 'User and blocked user are identical', 'status': 'Error'}, status=401)
			return JsonResponse({'message': f'User {blocked_user_id} has been unblocked', 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)
		
class isUserBlockedView(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		user = request.user
		target_user_id = request.GET.get('targetUserId')

		if isinstance(user, AnonymousUser):
			return JsonResponse({'message': 'No user found', 'status': 'error'}, status=404)
		
		try:
			target_user = get_object_or_404(User, id=target_user_id)
			is_blocked = user.blocked_users.filter(id=target_user_id).exists()
			return JsonResponse({'message': f'{is_blocked}', 'status': 'Success'}, status=200)
		except Http404:
			return JsonResponse({'message': 'Target User Not Found', 'status': 'Success'}, status=404)


