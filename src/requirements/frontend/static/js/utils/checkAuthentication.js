import { getCookie } from "./cookie.js";

export default async function checkAuthentication() {
	const config = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
		},
		credentials: 'include' // Needed for send cookie
	};

	try {
		const res = await fetch(`http://localhost:8000/account/protected/`, config);
		if (res.status === 403 || res.status === 401)
			return false;

		const data = await res.json();
		if (data.error) {
			return false;
		}

		return true;
	} catch (error) {
		return false;
	}
}