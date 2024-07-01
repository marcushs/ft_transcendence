import { getCookie } from "./cookie.js";

export default async function getUserInfos() {
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
		if (res.status == 403) {
			throw new Error('Access Denied');
		}
		const data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
	}
}