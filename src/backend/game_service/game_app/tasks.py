import time
import queue
import random
import redis
import json
import asyncio
from asgiref.sync import async_to_sync
import redis.asyncio as redis


async def background_task_game():
    await launch_task_as_async()


async def launch_task_as_async():
    redis_instance = redis.Redis(host='redis', port=6379, db=0)
    pubsub = redis_instance.pubsub()
    await pubsub.subscribe('matchmaking_manager')

    async for message in pubsub.listen():
        print(f'--------- Message is : {message['data']} ----------')  
        test()
    


async def test():
    print('--------- TEST -------')