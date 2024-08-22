import { getCookie } from "./cookie.js";
import checkAuthentication from "./checkAuthentication.js";

let languages = null;

export async function getUserLanguage() {
	let userLanguage;

	if (await checkAuthentication()) {
		userLanguage = await getUserLanguageFromDb();

		if (userLanguage) {
			localStorage.setItem('userLanguage', userLanguage);
			return userLanguage;
		}
	}

	userLanguage = localStorage.getItem("userLanguage");
	if (userLanguage)
		return userLanguage;

	userLanguage = navigator.language.split('-')[0];
	await setUserLanguageInDb(userLanguage);
	localStorage.setItem('userLanguage', userLanguage);

	return userLanguage;
}

export async function loadLanguagesJson() {
	try {
		const response = await fetch('./languages.json');
		const json = await response.json();
		languages = json[await getUserLanguage()];

		return languages;
	} catch (e) {
		console.log(e);
	}
}

export function getString(key) {
	const keys = key.split('/');

	if (keys.length === 2)
		return languages[keys[0]][keys[1]];

	return languages[key];
}

export async function setUserLanguageInDb(language) {
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
		},
		body: JSON.stringify({'language': language}),
		credentials: 'include' // Needed for send cookie
	};

	try {
		const res = await fetch('http://localhost:8000/user/language/', config);
	} catch (error) {
		console.log(error);
	}
}

async function getUserLanguageFromDb() {
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
		const res = await fetch('http://localhost:8000/user/language/', config);
		const data = await res.json();

		return data['language'];
	} catch (error) {
		console.log(error);
	}
}