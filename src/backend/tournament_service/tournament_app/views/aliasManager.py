from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User
import json
import re
 
class AliasManager(View):
	def __init__(self):
		super().__init__


	def get(self, request):
		if isinstance(request.user, AnonymousUser):
			return JsonResponse({'message': 'unknownUser'}, status=400)
		return JsonResponse({'alias': str(request.user.alias)}, status=200)



	def put(self, request):
		try:
			if isinstance(request.user, AnonymousUser):
				return JsonResponse({'message': 'unknownUser'}, status=400)
			data = json.loads(request.body.decode('utf-8'))	
			self.check_new_alias(data, request.user)
			request.user.alias = str(data['new_alias'])
			request.user.save()
			return JsonResponse({'alias_message': 'aliasChanged'}, status=200)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({'alias_error': str(e)}, status=400)


	def check_new_alias(self, data, user):
		if not 'new_alias' in data:
			raise Exception('aliasNotProvided')
		new_alias = data['new_alias']
		if new_alias == user.alias:
			raise Exception("aliasAlreadyYours")
		if User.objects.filter(alias=new_alias).exists():
			raise Exception("aliasAlreadyExists")
		if len(new_alias) > 12:
			raise Exception("aliasLenError")
		if re.search(r"^[a-zA-Z0-9_-]+$", new_alias) is None:
			raise Exception("aliasFormatError")