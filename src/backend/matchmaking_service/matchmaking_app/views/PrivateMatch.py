from ..utils.websocket_utils import send_websocket_info, send_websocket_game_found
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import AnonymousUser
from .matchmaking import change_is_ingame_state, is_already_in_waiting_list
from .process_matchmaking import send_start_game
from ..models import PrivateMatchLobby, User
from ..utils.user_utils import send_request
from asgiref.sync import async_to_sync
from django.http import JsonResponse 
from django.db.models import Q
from django.views import View
import json



class LobbyAlreadyExistError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message


def is_player_in_private_lobby(player):
    lobby = PrivateMatchLobby.objects.filter(Q(sender=player) | Q(receiver=player)).first()
    if lobby:
        return True
    return False

#//---------------------------------------> private match endpoint <--------------------------------------\\#

class PrivateMatchInit(View):  
    def __init__(self):
        super()


    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'User not connected'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            self.init(request=request, data=data)
            PrivateMatchLobby.objects.create(sender=self.user, receiver=self.invited_user)
            payload = {
                'receiver': self.invited_user.username,
                'type': 'private-match-invitation',
            }
            notifications_response = async_to_sync(send_request)(request_type='POST', url='http://notifications:8000/api/notifications/manage_notifications/', request=request, payload=payload)
            if notifications_response.json().get('status') == 'error':
                print(f"Error: {str(notifications_response.json().get('message'))}")
                raise Exception('notificationsRequestFailed')
            return JsonResponse({'message': 'lobbyCreated'}, status=200)
        except ObjectDoesNotExist:
            return JsonResponse({'message': f'unknownUser'}, status=400)
        except LobbyAlreadyExistError:
            return JsonResponse({'message': f'lobbyAlreadyExist'}, status=400)
        except Exception as e:
            print(f'Error: {str(e)}')  
            return JsonResponse({'message': str(e)}, status=400)


    def init(self, request, data):
        self.invited_user = self.get_invited_user(data)
        self.user = request.user
        if self.invited_user.id == self.user.id:
            raise Exception('cantInviteYourself')
        if is_player_in_private_lobby(self.user):
            raise LobbyAlreadyExistError('lobbyAlreadyExist')
        self.is_already_playing()


    def get_invited_user(self, data): 
        if 'invitedUsername' not in data:
            raise Exception('usernameMissing')
        invited_user = User.objects.get(username=str(data['invitedUsername'])) 
        return invited_user
    
    
    def is_already_playing(self):
        is_waiting, match_type = is_already_in_waiting_list(str(self.user.id))
        if is_waiting:
            raise Exception('userAlreadySearchGame')
        is_waiting, match_type = is_already_in_waiting_list(str(self.invited_user.id))
        if is_waiting:
            raise Exception('invitedUserAlreadySearchGame')
        if self.user.is_ingame == True:
            raise Exception('userAlreadyInGame')
        if self.invited_user.is_ingame == True:
            raise Exception('invitedUserAlreadyInGame')

#//---------------------------------------> private match cancel endpoint <--------------------------------------\\#

class CancelPrivateMatch(View):  
    def __init__(self):
        super()

    def post(self, request):        
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'message': 'notConnected'}, status=400)
            self.init(request=request)
            async_to_sync(send_websocket_info)(player_id=str(self.opponent.id), payload= {'type': 'private_match_canceled'})
            self.lobby.delete_lobby()
            return JsonResponse({'status': 'success', 'message': 'deletedLobby'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'message': str(e)}, status=400)


    def init(self, request):
        self.user = request.user
        self.lobby = self.get_lobby()
        self.opponent = self.lobby.sender if self.lobby.receiver == self.user else self.lobby.receiver
    
    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(Q(sender=self.user) | Q(receiver=self.user)).first()
        
        if not lobby:
            raise Exception('lobbyNotFound')
        
        return lobby

#//---------------------------------------> manage joining or not private match endpoint <--------------------------------------\\#

class PrivateMatchManager(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'message': 'notConnected'}, status=400)
            data = json.loads(request.body.decode('utf-8'))
            self.init(data=data, request=request)
            return self.process_choice()
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'message': str(e)}, status=400)


    def init(self, data, request):
        self.check_data(data)
        self.user = request.user
        self.sender_user = self.get_sender_username(data)
        self.lobby = self.get_lobby()
        self.choice = str(data['choice']) 
        
    
    def check_data(self, data):
        if 'sender_username' not in data:
            raise Exception('noUsernameProvided')
        if 'choice' not in data:
            raise Exception('noChoiceProvided')
        if data['choice'] != 'accepted' and data['choice'] != 'refused':
            raise Exception('invalidChoiceProvided')
            
    
    def get_sender_username(self, data):
        sender_user = User.objects.get(username=str(data['sender_username']))
        
        return sender_user
    
    
    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(sender=self.sender_user, receiver=self.user).first()
        
        if not lobby:
            raise Exception('lobbyNotFound')
        
        return lobby
    
    
    def process_choice(self):
        if self.choice == 'accepted':
            return self.handle_accepted_invitation()
        else:
            return self.handle_refused_invitation()
    
    def handle_accepted_invitation(self):
        send_websocket_game_found(player_id=str(self.sender_user.id), payload={'type': 'player_joined_private_match', 'player_id': str(self.user.id)})
        self.lobby.join_lobby()
        return JsonResponse({'status': 'success', 'message': 'privateMatchInvitAccepted'}, status=200)
    
    def handle_refused_invitation(self):
        send_websocket_game_found(player_id=str(self.sender_user.id), payload={'type': 'player_refused_private_match', 'player_id': str(self.user.id)})
        self.lobby.delete_lobby()
        return JsonResponse({'status': 'success', 'message': 'privateMatchInvitRefused'}, status=200)

#//---------------------------------------> Start private match endpoint <--------------------------------------\\#


class StartPrivateMatch(View):  
    def __init__(self):
        super()

    def post(self, request): 
        try:
            from .process_matchmaking import send_start_game
            
            if isinstance(request.user, AnonymousUser):  
                return JsonResponse({'status':'error', 'message': 'notConnected'}, status=400)
            self.init(request=request)
            change_is_ingame_state(value=True, user_instance=self.user)
            change_is_ingame_state(value=True, user_instance=self.opponent)
            send_websocket_game_found(player_id=str(self.opponent.id), payload={'type': 'private_match_started'})
            self.lobby.delete_lobby()
            send_start_game(game_type='private_match', player_one_id=str(self.user.id), player_two_id=str(self.opponent.id))
            return JsonResponse({'status': 'success', 'message': 'privateMatchStarted'}, status=200)
        except Exception as e: 
            print(f'Error: {str(e)}') 
            return JsonResponse({'message': str(e)}, status=400)


    def init(self, request):
        self.user = request.user
        self.lobby = self.get_lobby()
        self.opponent = self.lobby.sender if self.lobby.receiver == self.user else self.lobby.receiver


    def get_lobby(self):
        lobby = PrivateMatchLobby.objects.filter(Q(sender=self.user) | Q(receiver=self.user)).first()
        
        if not lobby:
            raise Exception('lobbyNotFound')
        if lobby.receiver_state != 'ready':
            raise Exception('invitedUserNotReady')
        return lobby