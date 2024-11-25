from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from ..models import User

 
class getAliasById(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			if isinstance(request.user, AnonymousUser): 
				return JsonResponse({'message': 'unknownUser'}, status=400)
			player_id = str(request.GET.get('player_id'))
			player = User.objects.get(id=player_id)
			return JsonResponse({'alias': player.alias}, status=200)
		except User.DoesNotExist:
			return JsonResponse({'message': 'unknownUser'}, status=400)
		except Exception as e:
			print(f'Error: {str(e)}')
			return JsonResponse({"message": str(e)}, status=500)
