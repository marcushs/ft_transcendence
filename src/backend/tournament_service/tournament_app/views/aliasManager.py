from django.core.exceptions import ValidationError
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
			return JsonResponse({'message': 'unknownUser'}, status=401)
		return JsonResponse({'alias': str(request.user.alias)}, status=200)



	def put(self, request):
		try:
			if isinstance(request.user, AnonymousUser):
				return JsonResponse({'message': 'unknownUser'}, status=401)
			data = json.loads(request.body.decode('utf-8'))	
			self.check_new_alias(data, request.user)
			request.user.alias = str(data['new_alias'])
			request.user.save()
			return JsonResponse({'alias_message': 'aliasChanged'}, status=200)
		except ValidationError as e:
			return JsonResponse({'message': str(e)}, status=400)
		except Exception as e:
			return JsonResponse({'message': str(e)}, status=500)


	def check_new_alias(self, data, user):
		if not 'new_alias' in data:
			raise ValidationError('aliasNotProvided')
		new_alias = data['new_alias']
		if new_alias == user.alias:
			raise ValidationError("aliasAlreadyYours")
		if User.objects.filter(alias=new_alias).exists():
			raise ValidationError("aliasAlreadyExists")
		if len(new_alias) > 12:
			raise ValidationError("aliasLenError")
		if re.search(r"^[a-zA-Z0-9_-]+$", new_alias) is None:
			raise ValidationError("aliasFormatError")
