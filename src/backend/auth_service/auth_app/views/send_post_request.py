from django.http import JsonResponse
import requests
import json

def send_post_request_with_token(request, url, payload, jwt, jwt_refresh):
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': request.COOKIES.get('csrftoken')
    }
    cookies = {
        'csrftoken': request.COOKIES.get('csrftoken'),
        'jwt': jwt,
        'jwt_refresh': jwt_refresh,
    }
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    print('-----> ', response)
    if response.status_code == 200:
        return JsonResponse({'message': 'success'}, status=200)
    else:
        # response_data = json.loads(response)
        # message = response_data.get('message')
        return JsonResponse({'message': 'fail'}, status=400)
 
 
def send_post_request_without_token(url, payload, csrf_token):
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
    }
    cookies = {'csrftoken': csrf_token}
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    if response.status_code == 200:
        return JsonResponse({'message': 'success'}, status=200)
    else:
        response_data = json.loads(response.text)

        message = response_data.get('message')
        return JsonResponse({'message': message}, status=400)