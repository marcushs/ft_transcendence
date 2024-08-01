import { getCookie } from "./cookie.js";

const config = {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
	};

export async function redirectToOauth() {
	try {
		const res = await fetch(`http://localhost:8003/oauth/login/`, config);
		const data = await res.json();
		console.log(data);
		window.location.replace(data.url);
	} catch (error) {
		console.log(error);
	}
}

export async function handleOauthCallback(code, state) {
	try {
		const res = await fetch(`http://localhost:8003/oauth/redirect/?code=${code}&state=${state}`, config);
		const data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}

export async function accessResource() {
	try {
		const res = await fetch(`http://localhost:8003/oauth/access_resource/`, config);
		const data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
}
