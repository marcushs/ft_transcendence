import { getCookie } from "./cookie.js";

'../utils/cookie.js'

let languages = null;

// function setUserLanguage() {
//
// }
async function getUserLanguage() {
	let userLanguage = await getUserLanguageFromDb();

	if (userLanguage)
		return userLanguage;

	userLanguage = navigator.language.split('-')[0];
	await setUserLanguageInDb(userLanguage);

	return userLanguage;
}

export async function loadLanguagesJson() {
	try {
		const response = await fetch('./languages.json');
		const json = await response.json();
		languages = json[await getUserLanguage()];
	} catch (e) {
		console.log(e);
	}
}

export function getStringByLanguage(key) {
	console.log(languages[key])
}

async function setUserLanguageInDb(language) {
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
		console.log('setter')
	} catch (error) {
		console.log('setter error')
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