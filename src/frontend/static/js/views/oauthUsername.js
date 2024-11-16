import { getCookie } from "../utils/cookie.js";
import { getPortNumber } from "../utils/oauthUtils.js";
import {getString} from "../utils/languageManagement.js";
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const html = `
		<section class="oauth-username-page">
			<div class="oauth-username-container-background"></div>
			<div class="oauth-username-container">
				<div class="oauth-username-content">
					<h1>${getString("oauthUsernameView/title")}</h1>
					<form>
						<input type="text" placeholder="username" name="newUsername" id="username" maxlength="12"/>
						<div class="feedback-container">
							<span id="feedbackElement"></span>
						</div>
					</form>
					<button-component label="submit" id="btn" class="generic-btn-disabled"></button-component>
				</div>
			</div>
		</section>
	`;

	setTimeout(() => {
		attachEventListeners();
		const btn = document.getElementById('btn');

		btn.addEventListener("click", postNewUsername);
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
	const feedbackElement = document.getElementById("feedbackElement");
	const newUsername = document.getElementById('username').value;
	const urlParams = new URLSearchParams(window.location.search);
	console.log(urlParams)
	const oauthProvider = urlParams.get('oauth_provider');

	feedbackElement.innerText = '';

	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
		body: JSON.stringify({newUsername: newUsername}), // Send form values as JSON
	};

	try {
		const res = await fetch(`/api/${oauthProvider}/update_username/`, config);
		// if (res.status == 403)
		// 	throw new Error('Access Denied')
		const data = await res.json();
		if (data.status !== "Error")
			window.location.replace(data.url);
	} catch (error) {
		// console.log('Catch error :', error);
	}
}