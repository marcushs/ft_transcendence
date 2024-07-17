from django.contrib.auth import get_user_model
from .utils.rabbitmq_utils import consume_message
from asgiref.sync import sync_to_async
import json
import asyncio

User = get_user_model()


def start_consumer():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run_consumer())

   
async def run_consumer():
    print("Starting RabbitMQ consumer...")
    await consume_message('auth_updates', process_message)


async def process_message(ch, method, properties, body):
    action = body.get('action')
    data = body.get('data')
    print("-------------------->>>>>>>>>>> On est bien rentrer dans le thread il a lu message !!!!!!!!!!!!!!!!!!!!!! :")

    match action:
        case 'user_created':
            sync_to_async(process_created_user)(data)
        case 'user_updated':
            pass
        case 'user_deleted':
            pass


def process_created_user(data):
    User.objects.create_user(id=data['user_id'],username=data['username'], email=data['email'])