import asyncio

async def run_users_status_task():
    while True:
        print("update of users status worker run..")
        await asyncio.sleep(60)

async def start_background_tasks():
    # Create and start task
    task = asyncio.create_task(run_users_status_task())  
    
    # Waiting indefinitely to keep the task alive
    await asyncio.Future() 