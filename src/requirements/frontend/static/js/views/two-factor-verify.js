import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/two_factor_auth/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js";
import { setTwoFactorLocalStorage } from "../utils/setTwoFactorLocalStorage.js";

export class TwoFactorVerify {
	// enableTwoFactorRequest();
	constructor(userInfos) {
		this.userInfos = userInfos;

		app.innerHTML = `
			<section class="two-factor-verify-page">
				<div class="two-factor-verify-form-container-background"></div>
				<div class="two-factor-verify-form-container">
					<form>
						${this.renderViewByMethod(localStorage.getItem('twoFactorMethod'))}
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
			const userData = await getUserData();

			this.attachEventListeners();

			const userEmail = document.querySelector('p > strong');
			if (userEmail)
				userEmail.innerHTML = userData.email;

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
		VerifyTwoFactorRequest(verificationCode, this.userInfos);
	}


	renderViewByMethod(authenticationMethod) {
		if (authenticationMethod === 'email') {
			return `
				<h1>Verify 2fa by email</h1>
				<p>
					To verify 2fa, please enter the code you received at the following email:
				</p>
				<p><strong></strong></p>
			`;
		} else {
			return `
				<h1>Verify 2fa by app</h1>
				<p>
					To verify 2fa, please enter the code you received on your authenticator application.
				</p>
			`;
		}
	}

}

async function VerifyTwoFactorRequest(verificationCode, userInfos) {
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
			...userInfos,
		})
	}
	const res = await fetch('http://localhost:8001/auth/login/', config);
	if (res.status === 403)
		throw new Error('Access Denied')
	const data = await res.json();
	if (res.status === 200) {
		throwRedirectionEvent('/');
		setTwoFactorLocalStorage();
	} else
		document.querySelector('.feedbackInformation').innerHTML = data.message;
}