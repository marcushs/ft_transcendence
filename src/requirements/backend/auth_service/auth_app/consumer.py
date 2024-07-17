from utils.rabbitmq_utils import consume_message
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def process_message(body):
    message = json.loads(body)
    match message['action']:
        case 'update':
            pass
        case 'create':
            pass