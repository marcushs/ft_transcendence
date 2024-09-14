// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import loginFormValidation from "../utils/loginFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";
import {TwoFactorVerify} from './two-factor-verify.js';
import {getString, loadLanguagesJson} from '../utils/languageManagement.js';
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {sendRequest} from "../utils/sendRequest.js";
import {loadWebSocket} from "../utils/loadWebSocket.js";

export default () => {
	const html = `
		<section class="login-page">
			<div class="login-form-container-background"></div>
			<div class="login-form-container">
				<form>
					<h1>${getString('loginView/loginTitle')}</h1>
					<div class="form-fields">
						<input type="text" placeholder="${getString('loginView/username')}" name="username" autofocus required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="${getString('loginView/password')}" name="password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<a href="/change-password" id="forgotten-password">${getString('loginView/forgottenPassword')}</a>
					</div>
					<button-component id="loginBtn" label="login" class="generic-auth-btn-disabled"></button-component>
					<p>${getString('loginView/noAccountSentence')} <a href="/signup">${getString('loginView/signup')}</a></p>
					<span id="feedbackElement" class="input-feedback"></span>
				</form>
			</div>
		</section>`;

	setTimeout(() => {
		const loginBtn = document.querySelector('#loginBtn');

		loginBtn.addEventListener('click', event => {
			event.preventDefault();
			if (loginBtn.className === 'generic-auth-btn')
				postData(event, loginBtn);
		});

		document.addEventListener('input', event => {
			document.querySelector('#feedbackElement').innerHTML = '';
		});

		displayFeedback();

		rotatingGradient('.login-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.login-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.login-form-container > form', '#1c0015', '#001519');
		loginFormValidation();
		managePasswordToggle('password');
	}, 0);

	return html;
}

function displayFeedback() {
	const feedbackElement = document.querySelector('#feedbackElement');
	const errorMessage = localStorage.getItem('errorFeedback');
	const successMessage = localStorage.getItem('successFeedback');

	if (errorMessage) {
		feedbackElement.style.color = 'red';
		feedbackElement.innerHTML = errorMessage;
		localStorage.removeItem('errorFeedback');
	}
	if (successMessage) {
		feedbackElement.style.color = '#32CD32';
		feedbackElement.innerHTML = successMessage;
		localStorage.removeItem('successFeedback');
	}
}

async function postData(event, loginBtn) {
	event.preventDefault();

	const form = loginBtn.closest('form');
	const formData = new FormData(form);
	const formValues = Object.fromEntries(formData.entries());
	const url = `http://localhost:8001/auth/login/`;

	try {
		const data = await sendRequest('POST', url, formValues);

		if (data.is_verified === true)
			new TwoFactorVerify(formValues, data);
		else {
			await loadLanguagesJson();
			throwRedirectionEvent('/');
			loadWebSocket();
		}
	} catch (error) {
		localStorage.setItem('errorFeedback', error.message);
		throwRedirectionEvent('/login');
	}
}