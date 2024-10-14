import httpx
import json

async def send_request(request_type, url, payload=None):
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
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    } 
    cookies = None
    return headers, cookies