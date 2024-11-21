import { getCookie } from "../utils/cookie.js";
import {getString} from "../utils/languageManagement.js";
import rotatingGradient from "../anim/rotatingGradient.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js";

export default () => {
	const html = `
		<section class="oauth-username-page">
			<div class="oauth-username-container-background"></div>
			<div class="oauth-username-container">
				<div class="oauth-username-content">
					<h1>${getString("oauthUsernameView/title")}</h1>
					<form>
						<input type="text" placeholder="${getString("oauthUsernameView/username")}" name="newUsername" id="username" maxlength="12"/>
						<div class="feedback-container">
							<span id="feedbackElement"></span>
						</div>
					</form>
					<button-component label="change" id="btn" class="generic-btn-disabled"></button-component>
				</div>
			</div>
		</section>
	`;

	setTimeout(() => {
		attachEventListeners();
		const btn = document.getElementById('btn');

		btn.addEventListener("click", event => {
			event.preventDefault();
			postNewUsername()
		});
		rotatingGradient('.oauth-username-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.oauth-username-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.oauth-username-content', '#1c0015', '#001519');
	}, 0);
	return html;
}

function attachEventListeners() {
	const inputElement = document.querySelector('.oauth-username-content input');
	const feedbackElement = document.querySelector('.oauth-username-content #feedbackElement');
	const button = document.querySelector('.oauth-username-content button-component');

	inputElement.addEventListener("input", event => manageInputValidity(inputElement, feedbackElement, button)); 
}


function manageInputValidity(inputElement, feedbackElement, button) {

	if (inputElement.value === '') {
		button.className = 'generic-btn-disabled';
		feedbackElement.innerText = '';
		return ;
	}

	if (feedbackElement.innerText !== '' || inputElement.value === '')
		feedbackElement.innerText = '';

	if (!/^[a-zA-Z0-9_-]+$/.test(inputElement.value) && inputElement.value !== '') {
		feedbackElement.textContent = getString("oauthUsernameView/usernameFormatError");
		button.className = "generic-btn-disabled";
	}
	else
		button.className = "generic-btn";
}


async function postNewUsername() {
	console.log('clicked')
	const feedbackElement = document.getElementById("feedbackElement");
	const newUsername = document.getElementById('username').value;
	const urlParams = new URLSearchParams(window.location.search);
	const oauthProvider = urlParams.get('oauth_provider');

	if(!oauthProvider || (oauthProvider !== 'oauth42' && oauthProvider !== 'oauthgoogle' && oauthProvider !== 'oauthgithub'))
		return throwRedirectionEvent('/login');

	feedbackElement.innerText = '';

	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') 
		},
		credentials: 'include',
		body: JSON.stringify({newUsername: newUsername}),
	};

	try {
		const res = await fetch(`/api/${oauthProvider}/update_username/`, config);
		if (res.status === 409 || res.status === 404) {
			return throwRedirectionEvent(await res.json().url);
		}
		const data = await res.json();
		if (data.status !== "Error")
			throwRedirectionEvent('/')
	} catch (error) {
		console.log('Error :', error);
		throwRedirectionEvent('/login')
	}
}
