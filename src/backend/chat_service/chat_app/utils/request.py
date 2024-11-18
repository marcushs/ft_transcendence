from django.http import JsonResponse
import requests
import httpx
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
        
async def send_request_with_request(request_type, url, request=None, payload=None):
    if request:
        headers, cookies = set_headers_cookies_request(request=request)
    else:
        headers, cookies = set_headers_cookies_request()
    try:
        async with httpx.AsyncClient() as client:
            if request_type == 'GET':
                response = await client.get(url, headers=headers, cookies=cookies)
            elif request_type == 'PUT':
                response = await client.put(url, headers=headers, cookies=cookies, content=json.dumps(payload))
            else:
                response = await client.post(url, headers=headers, cookies=cookies, content=json.dumps(payload))
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response
    except httpx.HTTPStatusError as e:
        raise Exception(f"HTTP error occurred: {e}")
    except httpx.RequestError as e:
        raise Exception(f"An error occurred while requesting: {e}")

def set_headers_cookies_request(request=None):
    if request:
        headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': request.COOKIES.get('csrftoken')
            } 
        cookies = {
            'csrftoken': request.COOKIES.get('csrftoken'),
            'jwt': request.COOKIES.get('jwt'),
            'jwt_refresh': request.COOKIES.get('jwt_refresh'),
            }
    else:
        headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            } 
        cookies = None
    return headers, cookies
