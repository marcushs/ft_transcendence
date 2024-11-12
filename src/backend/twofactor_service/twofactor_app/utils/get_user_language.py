from .send_request import send_request

async def get_user_language(request):
    try:
        data = await send_request(request_type='GET', url='http://user:8000/api/user/language/', request=request)
        language = data.json().get('language', 'en')
        return language
    except Exception as e:
        print(f'Error: {str(e)}')
        return None 