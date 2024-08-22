import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js";
import { setTwoFactorLocalStorage } from "../utils/setTwoFactorLocalStorage.js";
import {loadLanguagesJson} from '../utils/languageManagement.js';
import {getString} from "../utils/languageManagement.js";

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
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
		body: JSON.stringify(userCredentials)
	};
	try {
		const res = await fetch(`http://localhost:8002/twofactor/get_2fa_code/`, config);
		if (res.status === 403)
			throw new Error('Access Denied')
		const data = await res.json();
		if (res.status !== 200)
			throw new Error(data.message);
	} catch (error) {
		alert(`Error: ${error.message}`);
	}
}

async function VerifyTwoFactorRequest(verificationCode, userCredentials) {
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
		body: JSON.stringify({
			twofactor: verificationCode,
			...userCredentials,
		})
	}
	const res = await fetch('http://localhost:8001/auth/login/', config);
	if (res.status === 403)
		throw new Error('Access Denied')
	const data = await res.json();
	if (res.status === 200) {
		await loadLanguagesJson();
		throwRedirectionEvent('/');
		setTwoFactorLocalStorage();
	} else
		document.querySelector('.feedbackInformation').innerHTML = data.message;
}