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
import { redirectToOauth } from "../utils/oauthUtils.js";

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
					<button-component id="loginBtn" label="Login" class="generic-auth-btn-disabled"></button-component>
					<button-component id="oauth42LoginBtn" label="Login with " class="generic-auth-btn" icon="logo_42">
					</button-component>
					<button-component id="oauthGoogleLoginBtn" label="Login with " class="generic-auth-btn" icon="logo_google">
					</button-component>
					<button-component id="oauthGithubLoginBtn" label="Login with " class="generic-auth-btn" icon="logo_github">
					</button-component>
					<button-component id="loginBtn" label="login" class="generic-auth-btn-disabled"></button-component>
					<p>${getString('loginView/noAccountSentence')} <a href="/signup">${getString('loginView/signup')}</a></p>
					<span id="feedbackElement" class="input-feedback"></span>
				</form>
			</div>
		</section>`;

	setTimeout(() => {
		const loginBtn = document.querySelector('#loginBtn');
		const oauth42LoginBtn = document.getElementById('oauth42LoginBtn');
		const oauthGoogleLoginBtn = document.getElementById('oauthGoogleLoginBtn');
		const oauthGithubLoginBtn = document.getElementById('oauthGithubLoginBtn');

		loginBtn.addEventListener('click', event => {
			event.preventDefault();
			if (loginBtn.className === 'generic-auth-btn')
				postData(event, loginBtn);
		});

		oauth42LoginBtn.addEventListener('click', () => redirectToOauth("oauth_42"));
		oauthGoogleLoginBtn.addEventListener('click', () => redirectToOauth("oauth_google"));
		oauthGithubLoginBtn.addEventListener('click', () => redirectToOauth("oauth_github"));

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
	const url = `/api/auth/login/`;

	try {
		const data = await sendRequest('POST', url, formValues);

		if (data.is_verified === true)
			new TwoFactorVerify(formValues, data);
		else {
			await loadLanguagesJson();
			throwRedirectionEvent('/');
		}
	} catch (error) {
		localStorage.setItem('errorFeedback', error.message);
		throwRedirectionEvent('/login');
	}
}
