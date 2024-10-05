import redis
from .tasks import start_game_instance

def listen_for_games():
    redis_instance = redis.Redis(host='redis', port=6379, db=0)
    pubsub = redis_instance.pubsub()
    pubsub.subscribe('matchmaking_manager')

    for message in pubsub.listen():
        print('--------- Message is : ', message['data'])  
        start_game_instance.delay(message['data'])