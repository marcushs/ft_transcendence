from django.http import JsonResponse
import requests
import json

def send_post_request(url, payload, csrf_token):
    print('here') 
    headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
    cookies = {'csrftoken': csrf_token}
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    if response.status_code == 200:
        print('status 200')
        return JsonResponse({'message': 'success'}, status=200)
    else:
        response_data = json.loads(response.text)
        print('status != 200')
        message = response_data.get('message')
        return JsonResponse({'message': message}, status=400)
