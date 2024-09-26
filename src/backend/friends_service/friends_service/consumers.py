from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ContactsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        try:
            if self.user.is_anonymous:
                await self.close()
            else:
                self.group_name = f'user_{self.user.id}'
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
        except Exception as e:
            print('Error while connecting contacts websockets ', e)


    async def disconnect(self, close_code):
        pass


    async def receive(self, text_data):
        pass
    
    async def friend_update(self, event):
        await self.send(text_data=json.dumps(
            {
                'type' : event['event'],
                'message': event['message'],
                'contact': event['contact'],
                'is_sender': event['is_sender']
            }
        ))
        
    async def contact_info_update(self, event): 
        await self.send(text_data=json.dumps(
            {
                'type' : event['event'],
                'contact': event['contact'],
                'change_info': event['change_info'],
                'old_value': event['old_value']
            }
        ))  