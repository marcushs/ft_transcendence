from .user_utils import send_request


async def notify_user_info_display_change(request, change_info, old_value=None):  
    payload = { 
        'username': request.user.username,
        'profile_image': request.user.profile_image.url if request.user.profile_image else None,
        'profile_image_link': request.user.profile_image_link,
        'status': request.user.status,
        'change_info': change_info,
        'old_value': old_value
    }
    await send_request(request_type='POST', request=request, url='http://friends:8000/friends/update_contacts/', payload=payload)