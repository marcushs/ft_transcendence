from channels.generic.websocket import AsyncWebsocketConsumer
from utils.rabbitmq_utils import consume_message
from asgiref.sync import sync_to_async
import json

class RabbitMQConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.start_consuming()

    async def start_consuming(self):
        def callback(body):
            message = json.loads(body)
            sync_to_async(self.send)(text_data=json.dumps(message))
    
        await consume_message('db_update', callback)

    async def disconnect(self, close_code):
        pass