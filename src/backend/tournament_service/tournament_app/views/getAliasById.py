from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from ..models import User

 
class getAliasById(View):
	def __init__(self):
		super().__init__

	def get(self, request):
		try:
			if isinstance(request.user, AnonymousUser): 
				return JsonResponse({'message': 'unknownUser'}, status=401)
			player_id = str(request.GET.get('player_id', None))
			if player_id is None:
				return JsonResponse({'message': 'No player id provided'}, status=400)
			player = User.objects.get(id=player_id)
			return JsonResponse({'alias': player.alias}, status=200)
		except ObjectDoesNotExist:
			return JsonResponse({'message': 'unknownUser'}, status=404)
		except User.DoesNotExist:
			return JsonResponse({'message': 'unknownUser'}, status=404)
		except Exception as e:
			return JsonResponse({"message": str(e)}, status=500)
