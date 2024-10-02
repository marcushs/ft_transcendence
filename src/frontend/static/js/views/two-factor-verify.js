import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js";
import { setTwoFactorLocalStorage } from "../utils/setTwoFactorLocalStorage.js";
import {loadLanguagesJson} from '../utils/languageManagement.js';
import {getString} from "../utils/languageManagement.js";
import {sendRequest} from "../utils/sendRequest.js";

export class TwoFactorVerify {
	// enableTwoFactorRequest();
	constructor(userCredentials, userData) {
		this.userCredentials = userCredentials;

		app.innerHTML = `
			<section class="two-factor-verify-page">
				<div class="two-factor-verify-form-container-background"></div>
				<div class="two-factor-verify-form-container">
					<form>
						${this.renderViewByMethod(userData.two_factor_method)}
				        <div class="form-fields">
				        <two-factor-input-component></two-factor-input-component>
						</div>
						<p class="feedbackInformation"></p>
						<button-component label="Verify" class="generic-auth-btn"></button-component>
					</form>
				</div>
			</section>
		`;

		setTimeout(async () => {
			this.attachEventListeners();

			const userEmail = document.querySelector('p > strong');
			if (userEmail) {
				sendTwoFactorCode(this.userCredentials);
				userEmail.innerHTML = userData.email;
			}

			rotatingGradient('.two-factor-verify-form-container-background', '#FF16C6', '#00D0FF');
			rotatingGradient('.two-factor-verify-form-container', '#FF16C6', '#00D0FF');
			rotatingGradient('.two-factor-verify-form-container > form', '#1c0015', '#001519');
		}, 0);
	}


	attachEventListeners() {
		document.querySelector('form').addEventListener('submit', (event) => this.handleSubmit(event));
	}


	handleSubmit(event) {
		event.preventDefault();
		const inputs = [...event.target.querySelectorAll('input')];
		const verificationCode = inputs.reduce((acc, input) => acc += input.value, '');
		VerifyTwoFactorRequest(verificationCode, this.userCredentials);
	}


	renderViewByMethod(authenticationMethod) {
		if (authenticationMethod === 'email') {
			return `
				<h1>${getString('twoFactorVerifyView/emailTitle')}</h1>
				<p>${getString('twoFactorVerifyView/emailParagraph')}</p>
				<p><strong></strong></p>
			`;
		} else {
			return `
				<h1>${getString('twoFactorVerifyView/authenticatorTitle')}</h1>
				<p>${getString('twoFactorVerifyView/authenticatorParagraph')}</p>
			`;
		}
	}

}

async function sendTwoFactorCode(userCredentials) {
	const url = '/api/twofactor/get_2fa_code/';

	try {
		await sendRequest('POST', url, userCredentials );
	} catch (error) {
		console.error(error);
	}
}

async function VerifyTwoFactorRequest(verificationCode, userCredentials) {
	const url = '/api/auth/login/';

	try {
		const data = await sendRequest('POST', url, {
			twofactor: verificationCode,
			...userCredentials,
		});

		await loadLanguagesJson();
		throwRedirectionEvent('/');
		const event = new CustomEvent('userLoggedIn');
		document.dispatchEvent(event);
		setTwoFactorLocalStorage();
	} catch (error) {
		document.querySelector('.feedbackInformation').innerHTML = error.message;
	}
}
