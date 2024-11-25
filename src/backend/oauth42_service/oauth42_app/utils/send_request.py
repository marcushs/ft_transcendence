from django.http import JsonResponse
import requests
import json

def send_request_with_token(request_type, request, url, jwt_token=None, jwt_refresh_token=None, payload=None):
    if jwt_token is None:
        jwt_token = request.COOKIES.get('jwt')
    if jwt_refresh_token is None:
        request.COOKIES.get('jwt_refresh')
    headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': request.COOKIES.get('csrftoken')
        }
    cookies = {
        'csrftoken': request.COOKIES.get('csrftoken'),
        'jwt': jwt_token,
        'jwt_refresh': jwt_refresh_token,
        }
    try:
        if request_type == 'GET': 
            response = requests.get(url=url, headers=headers, cookies=cookies)
        else:
            response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
        if response.status_code == 200:
            return response
        else:
            response.raise_for_status()
    except Exception as e:
        raise Exception(f"An error occurred: {e}")


def send_request_without_token(request_type, url, payload, csrf_token):
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token
    }
    cookies = {'csrftoken': csrf_token}
    try:
        if request_type == 'GET':
            response = requests.get(url=url, headers=headers, cookies=cookies)
        else:
            response = requests.post(url=url, headers=headers, cookies=cookies ,data=json.dumps(payload))
        if response.status_code == 200:
            return response
        else:
            response.raise_for_status()
    except Exception as e:
        raise Exception(f"An error occurred: {e}")
