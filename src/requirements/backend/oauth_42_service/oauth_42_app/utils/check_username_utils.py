import requests

def check_username_is_free(username):
	response = requests.get('http://auth:8000/auth/check_username/', params={"username", username})
	return response
