import { getCookie } from "./cookie.js";
import checkAuthentication from "./checkAuthentication.js";
import {sendRequest} from "./sendRequest.js";

let languages = null;

export async function getUserLanguage() {
	let userLanguage;
	const isAuthenticated = await checkAuthentication();

	if (isAuthenticated) {
		
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
	
	if (isAuthenticated)
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
	const url = `/api/user/language/`;

	try {
		await sendRequest('POST', url, {'language': language});
	} catch (error) {
		console.error(error);
	}
}

async function getUserLanguageFromDb() {
	const url = '/api/user/language/';

	try {
		const data = await sendRequest('GET', url, null);

		return data['language'];
	} catch (error) {
		console.error(error);
	}
}
