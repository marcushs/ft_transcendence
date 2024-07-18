from .utils.rabbitmq_utils import consume_message
from .models import User
import json

def delayed_consumer_start():
    from .consumer import run_consumer
    time.sleep(10)
    consumer_thread = threading.Thread(target=run_consumer)
    consumer_thread.start()
 
def run_consumer():
    print("Starting RabbitMQ consumer...")
    consume_message('auth_updates', process_message)


def process_message(ch, method, properties, body):
    message = json.loads(body.decode('utf-8'))
    action = message.get('action')
    data = message.get('data')
    
    match action:
        case 'user_created':
            process_created_user(data)
        case 'user_updated':
            pass
        case 'user_deleted':
            pass


def process_created_user(data):
    User.objects.create_user(email=data['email'], username=data['username'], user_id=data['user_id'])