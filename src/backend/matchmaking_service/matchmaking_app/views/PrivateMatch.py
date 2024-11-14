from ..utils.websocket_utils import send_websocket_info
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from .process_matchmaking import send_start_game
from .matchmaking import change_is_ingame_state
from ..models import PrivateMatchLobby, User
from ..utils.user_utils import send_request
from asgiref.sync import async_to_sync
from django.http import JsonResponse 
from django.views import View
import json
from django.db.models import Q


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
            payload = {
                'receiver': invited_user.username,
                'type': 'private-match-invitation',
            }
            notifications_response = async_to_sync(send_request)(request_type='POST', url='http://notifications:8000/api/notifications/manage_notifications/', request=request, payload=payload)
            if notifications_response.json().get('status') == 'error':
                raise Exception(str(notifications_response.json().get('message')))
            return JsonResponse({'message': 'lobbyCreated'}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'message': f'unknownUser'}, status=400)
        except Exception as e: 
            print(f'Error: {str(e)}')  
            return JsonResponse({'message': str(e)}, status=400)

    def get_invited_user(self, data):
        if 'invitedUsername' not in data:
            raise Exception('usernameMissing')
        invited_user = User.objects.get(username=str(data['invitedUsername'])) 
        return invited_user


#//---------------------------------------> private match cancel endpoint <--------------------------------------\\#

class CancelPrivateMatch(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            self.init(data=data, request=request)
            self.lobby.delete_lobby()
            change_is_ingame_state(value=False, user_instance=request.user)
            return JsonResponse({'status': 'success', 'message': 'Lobby deleted'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'status': 'error', 'message': 'An error occurred while init private match'}, status=400)


    def init(self, data, request):
        self.user = request.user
        self.invited_user = self.get_invited_user(data)
        self.lobby = self.get_lobby()
        
        
    def get_invited_user(self, data):
        if 'invitedUsername' not in data:
            raise Exception('username missing in payload')
        invited_user = User.objects.get(username=str(data['invitedUsername']))
        return invited_user
    
    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(Q(sender=self.user, receiver=self.invited_user) | Q(sender=self.invited_user, receiver=self.user)).first()
        
        if not lobby:
            raise Exception('No lobby found')
        
        return lobby

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
            return JsonResponse({'status': 'error', 'message': 'An error occurred while joining private match'}, status=400)


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
            raise Exception('No lobby found')
        
        return lobby
    
    
    def process_choice(self):
        if self.choice == 'accepted':
            return self.handle_accepted_invitation()
        else:
            return self.handle_refused_invitation()
    
    def handle_accepted_invitation(self):
        async_to_sync(send_websocket_info)(player_id=self.user.id, payload={'type': 'player_joined_private_match', 'player_id': self.user.id})
        self.lobby.join_lobby()
        return JsonResponse({'status': 'success', 'message': 'Private match lobby accepted'}, status=200)
    
    def handle_refused_invitation(self):
        async_to_sync(send_websocket_info)(player_id=self.user.id, payload={'type': 'player_refused_private_match', 'player_id': self.user.id})
        self.lobby.delete_lobby()
        return JsonResponse({'status': 'success', 'message': 'Private match lobby refused'}, status=200)

#//---------------------------------------> Start private match endpoint <--------------------------------------\\#






class StartPrivateMatch(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            self.init()
            change_is_ingame_state(value=True, user_instance=self.user)
            change_is_ingame_state(value=True, user_instance=self.invited_user)
            send_websocket_info(player_id=self.invited_user.id, payload={'type': 'private_match_started'})
            send_start_game(game_type='private_match', player_one_id=self.user.id, player_two_id=self.invited_user.id)
            return JsonResponse({'status': 'success', 'message': 'Private match lobby started'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'status': 'error', 'message': f'An error occurred while checking private match: {str(e)}'}, status=400)


    def init(self, data, request):
        self.user = request.user
        self.invited_user = self.get_invited_user(data) 
        self.lobby = self.get_lobby()
        
        
    def get_invited_user(self, data):
        if 'invitedUsername' not in data:
            raise Exception('username missing in payload')
        invited_user = User.objects.get(username=str(data['invitedUsername']))
        return invited_user
    
    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(sender=self.sender_user, receiver=self.user).first()
        
        if not lobby:
            raise Exception('No lobby found')
        if lobby.receiver_state != 'ready':
            raise Exception('Invited user not ready')
        return lobby