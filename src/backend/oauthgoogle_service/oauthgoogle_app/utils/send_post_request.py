from django.http import JsonResponse
import requests
import json

def send_post_request(url, payload, csrf_token):
    headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        }
    cookies = {'csrftoken': csrf_token}
    response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
    response_data = response.json()
    if response.status_code == 200:
        return JsonResponse(response_data)
    else:
        return response
