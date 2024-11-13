from django.contrib.auth.models import AnonymousUser
from ..models import PrivateMatchLobby, User
from django.http import JsonResponse 
from django.views import View
import json


#//---------------------------------------> private match endpoint <--------------------------------------\\#

class PrivateMatchInit(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            invited_user = self.get_invited_user(data)
            PrivateMatchLobby.objects.create(sender=request.user, receiver=invited_user)
            # envoie de la notif requete a notif
            return JsonResponse({'status': 'success', 'message': 'Lobby created'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'status': 'error', 'message': 'An error occurred while init private match'}, status=500)

    def get_invited_user(self, data):
        if 'invitedUsername' not in data:
            raise Exception('ussername missing in payload')
        invited_user = User.objects.get(username=str(data['invitedUsername']))
        return invited_user


#//---------------------------------------> manage joining or not private match endpoint <--------------------------------------\\#


class PrivateMatchManager(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            self.init(data=data, request=request)
            return self.process_choice()
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'status': 'error', 'message': 'An error occurred while joining private match'}, status=500)


    def init(self, data, request):
        self.check_data(data)
        self.user = request.user
        self.sender_user = self.get_sender_username(data)
        self.lobby = self.get_lobby()
        self.choice = str(data['choice'])
        
        print(f'---------------------------------------')
        print(f'---> sender_user: {self.sender_user}')
        print(f'---> choice: {self.choice}')
        print(f'---> LOBBY: {self.lobby}')
        print(f'---------------------------------------')
        
    
    def check_data(self, data):
        if 'sender_username' not in data:
            raise Exception('No sender username provided')
        if 'choice' not in data:
            raise Exception('No choice provided')
        if data['choice'] != 'accepted' and data['choice'] != 'refused':
            raise Exception('Invalid choice provided')
            
    
    def get_sender_username(self, data):
        sender_user = User.objects.get(username=str(data['sender_username']))
        
        return sender_user
    
    
    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(sender=self.sender_user, receiver=self.user).first()
        
        if not lobby:
            raise Exception('No lobby found for this users')
        
        return lobby
    
    
    def process_choice(self):
        if self.choice == 'accepted':
            return self.handle_accepted_invitation()
        else:
            return self.handle_refused_invitation()
    
    def handle_accepted_invitation(self):
        self.lobby.join_lobby()
        return JsonResponse({'status': 'success', 'message': 'Private match lobby accepted'}, status=200)
    
    def handle_refused_invitation(self):
        self.lobby.delete_lobby()
        return JsonResponse({'status': 'success', 'message': 'Private match lobby refused'}, status=200)

#//---------------------------------------> check private match endpoint <--------------------------------------\\#


class CheckPrivateMatch(View):  
    def __init__(self):
        super()

    def get(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            lobby_id = request.GET.get('lobby_id', None)
            if lobby_id is None:
                raise Exception('No lobby id provided')
            lobby_id = str(lobby_id)
            
            return JsonResponse({'status': 'success', 'message': 'Private match lobby created'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'status': 'error', 'message': 'An error occurred while checking private match'}, status=500)