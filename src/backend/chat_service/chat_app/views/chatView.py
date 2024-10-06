from django.views import View
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from ..models import *
import json

User = get_user_model()

class chat_view(View):
    def __init__(self):
        super().__init__
        
    def get(self,request):
        return JsonResponse({'message': "reached chat view"}, status=200)

    def post(self, request):
        data = json.loads(request.body.decode('utf-8'))
        chatroom_name = data['username']
        # chat_group = get_object_or_404(ChatGroup, group_name=chatroom_name)
        # message = GroupMessage.objects.create()
        # message.author = 
        print(data['username']) 
        return JsonResponse({'message': f'received message: {data['message']}'}, status=200)

# def get_or_create_chatroom(request, username):
#     # if request.user.username == username:
#     #     return JsonResponse({'message': 'Chatroom cannot be established', 'status': 'Error'}, status=404)
    
#     other_user = User.objects.get(username = username)
#     my_chatrooms = request.user.chat_groups.filter(is_private=True)
    
    
#     if my_chatrooms.exists():
#         for chatroom in my_chatrooms:
#             if other_user in chatroom.members.all():
#                 chatroom = chatroom
#                 break
#             else:
#                 chatroom = ChatGroup.objects.create(is_private = True)
#                 chatroom.members.add(other_user, request.user)
#     else:
#         chatroom = ChatGroup.objects.create(is_private = True)
#         chatroom.members.add(other_user, request.user)
        
#     return redirect('chatroom', chatroom.group_name)
 