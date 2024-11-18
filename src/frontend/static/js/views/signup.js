import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import validateSignupInputs from "../utils/signupFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getString, loadLanguagesJson} from "../utils/languageManagement.js";
import {sendRequest} from "../utils/sendRequest.js";

export default () => {
	const html = `
		<section class="signup-page">
			<div class="signup-form-container-background"></div>
			<div class="signup-form-container">
				<form>
					<h1>${getString('signupView/signupTitle')}</h1>
					<div class="form-fields">
						<input class="signup-input" type="text" placeholder="${getString('signupView/username')}" name="username" maxlength="12" required>
					</div>
					<div class="form-fields">
						<input class="signup-input" type="text" placeholder="${getString('signupView/email')}" name="email" autofocus required>
						<span id="emailFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input class="signup-input" type="password" placeholder="${getString('signupView/password')}" name="password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="passwordFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input class="signup-input" type="password" placeholder="${getString('signupView/confirmPassword')}" name="confirm_password" required>
						<i class="fa-solid fa-eye" id="confirm-password-eye"></i>
						<span id="confirmPasswordFeedback" class="input-feedback"></span>
					</div>
					<button-component id="signupBtn" label="signup" class="generic-auth-btn-disabled"></button-component>
					<p>${getString('signupView/existingAccountSentence')} <a id="login-redirect-button">${getString('signupView/login')}</a></p>
					<span id="errorFeedback" class="input-feedback"></span>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		const signupBtn = document.querySelector('#signupBtn');
		const loginRedirectButton = document.querySelector('#login-redirect-button');

		loginRedirectButton.addEventListener('click', () => throwRedirectionEvent('/login'));
		
		signupBtn.addEventListener('click', event => {
			event.preventDefault();
			if (signupBtn.className === 'generic-auth-btn') {
				postData(event, signupBtn);
			}
		});

		document.addEventListener('input', event => {
			if (event.target.className === 'signup-input')
				document.querySelector('#errorFeedback').innerHTML = '';
		});

		displayErrorFeedback();

		rotatingGradient('.signup-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.signup-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.signup-form-container > form', '#1c0015', '#001519');
		validateSignupInputs();
		managePasswordToggle('password');
		managePasswordToggle('confirm_password');
	}, 0);

	return html;
}

function displayErrorFeedback() {
	const errorMessage = localStorage.getItem('errorFeedback');

	if (errorMessage) {
		document.querySelector('#errorFeedback').innerHTML = errorMessage;
		localStorage.removeItem('errorFeedback');
	}
}

async function postData(event, signupBtn) {
	const form = signupBtn.closest('form');
	const formData = new FormData(form);
	const formValues = Object.fromEntries(formData.entries());
	const url = `/api/auth/signup/`;

	try {
		const data = await sendRequest('POST', url, formValues);

		localStorage.setItem('successFeedback', getString(`loginView/${data.message}`));
		throwRedirectionEvent('/login');
	} catch (error) {
		localStorage.setItem('errorFeedback', getString(`signupView/${error.message}`));
		throwRedirectionEvent('/signup');
	}
}
