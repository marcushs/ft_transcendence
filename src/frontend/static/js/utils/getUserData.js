import { getCookie } from "./cookie.js";

export default async function getUserData() {
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
		const res = await fetch(`http://localhost:8000/user/user_info/`, config);
		if (res.status == 403) {
			throw new Error('Access Denied');
		}
		const data = await res.json();
		return data.user;
	} catch (error) {
		console.log(error);
	}
}