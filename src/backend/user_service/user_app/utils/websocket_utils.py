from channels.layers import get_channel_layer
from .user_utils import send_request


async def notify_user_info_display_change(request, change_type):
    response = await send_request(request_type='GET', request=request, url='http://friends:8000/friends/search_contacts/')
    content = response.json()
    if content['status'] == 'error':
        return
    friends_id = [friend['id'] for friend in content['message']['friends'] if 'id' in friend]
    send_request_id = [request['id'] for request in content['message']['sent_requests'] if 'id' in request]
    receive_request_id = [request['id'] for request in content['message']['received_requests'] if 'id' in request]
    all_user_id = friends_id + send_request_id + receive_request_id   
    # for user_id in all_user_id:
    #     channel_layer = get_channel_layer()
    #     await channel_layer.group_send(
    #         f'user_{user_id}',
    #         {
    #             'type': 'contact_info_update',
    #             'event': 'status_update',
    #             'contact': request.user.username,
    #             'change': request.user.status
    #         }
    #     )