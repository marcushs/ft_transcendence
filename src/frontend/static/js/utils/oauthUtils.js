import { getCookie } from "./cookie.js";
import { throwRedirectionEvent } from "./throwRedirectionEvent.js";

const config = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
	};

// Callback function for oauthRedirect view
export async function oauthRedirectCallback() {
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const state = urlParams.get('state');
	const oauthProvider = state.slice(0, state.indexOf("-"));
	const status_text = document.getElementById('status');

	// Check if there are code and state in query param, request comes from 42 oauth
	if (code && state) {
		const data = await handleOauthCallback(oauthProvider, code, state);
		
		if (data.status === 'Success') {
			// if handleOauthCallback success
			const login_res = await accessResource(oauthProvider);
			if (!login_res || login_res.status === 'Error') {
				status_text.textContent = `Error: ${login_res ? login_res.message : 'Fetch failed'}`

				if (login_res && login_res.url)
					return setTimeout(() => window.location.href = login_res.url, 2000);
				setTimeout(() => throwRedirectionEvent('/login'), 2000);
				return ;
			}
			status_text.textContent = 'Successfully logged in';
			const event = new CustomEvent('userLoggedIn');
			document.dispatchEvent(event);
			throwRedirectionEvent('/');
		} else {
			// handleOauthCallback error
			status_text.textContent = `Error: ${data.message}`;
			// throwRedirectionEvent('/login');
		}
	} else {
		// No query params, not from 42 oauth
		status_text.textContent = 'Error: Invalid request';
			// throwRedirectionEvent('/login');
	}
}

// Callback function for login view
export async function redirectToOauth(oauthProvider) {
	try {
	const res = await fetch(`/api/${oauthProvider}/auth/`, config);
	const data = await res.json();
	console.log(data);
	window.location.replace(data.url);
} catch (error) {
	console.log(error);
}
}

async function handleOauthCallback(oauthProvider, code, state) {
	try {
		const res = await fetch(`/api/${oauthProvider}/redirect/?code=${code}&state=${state}`, config);
		const data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function accessResource(oauthProvider) {
	try {
		const res = await fetch(`/api/${oauthProvider}/access_resource/`, config);
		const data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}