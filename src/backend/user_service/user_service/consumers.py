from channels.generic.websocket import AsyncWebsocketConsumer

class ContactsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        pass


    async def disconnect(self, close_code):
        pass


    async def receive(self, text_data):
        pass