async def notify_user_info_display_change(change_info, user=None ,request=None, old_value=None):
    from .user_utils import send_request
    
    if user is None:
        user = request.user
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'profile_image': user.profile_image.url if user.profile_image else None,
        'profile_image_link': user.profile_image_link,
        'status': user.status,
        'change_info': change_info,
        'old_value': old_value
    }
    if request:
        await send_request(request_type='POST', request=request, url='http://friends:8000/api/friends/update_contacts/', payload=payload)
    else:
        await send_request(request_type='POST', url='http://friends:8000/api/friends/update_contacts/', payload=payload) 
