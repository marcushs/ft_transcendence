from django.views import View
from django.http import JsonResponse

class chat(View):
    def __init__(self):
        super().__init__
        
    def get(self,request):
        return JsonResponse({'message': "reached chat view"}, status=200)
