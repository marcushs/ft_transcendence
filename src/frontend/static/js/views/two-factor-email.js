// import '../components/two_factor_auth/TwoFactorEnableComponent.js';
import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {setTwoFactorLocalStorage} from "../utils/setTwoFactorLocalStorage.js";
import {getString} from "../utils/languageManagement.js";
import {sendRequest} from "../utils/sendRequest.js";

export default () => {
	enableTwoFactorRequest();

	const html = `
		<section class="two-factor-email-page">
			<div class="two-factor-email-form-container-background"></div>
			<div class="two-factor-email-form-container">
				<form>
					<h1>${getString('twoFactorEmailView/title')}</h1>
					<p>${getString('twoFactorEmailView/paragraph')}:</p>
					<p><strong></strong></p>
		            <div class="form-fields">
		            	<two-factor-input-component></two-factor-input-component>
					</div>
					<p class="feedbackInformation"></p>
					<button-component label="verify" class="generic-auth-btn"></button-component>
				</form>
			</div>
		</section>
	`;

	setTimeout(async () => {
		localStorage.setItem('state', 'security');
		const userData = await getUserData();

		document.querySelector('form').addEventListener('submit', (event) => {
			event.preventDefault();
			const inputs = [...event.target.querySelectorAll('input')];
			const verificationCode = inputs.reduce((acc, input) => acc += input.value, '');
			console.log(verificationCode)
			VerifyTwoFactorRequest(verificationCode);
		});

		document.querySelector('p > strong').innerHTML = userData.email;

		rotatingGradient('.two-factor-email-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-email-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-email-form-container > form', '#1c0015', '#001519');
	}, 0);

	return html;
}

async function enableTwoFactorRequest() {
	const url = `/api/twofactor/enable/`;

	try {
		await sendRequest('POST', url, { method: 'email' });
	} catch (error) {
		console.error(error);
	}
}

async function VerifyTwoFactorRequest(verificationCode) {
	const url = `/api/twofactor/enable/`;

	try {
		const data = await sendRequest('POST', url, { twofactor: verificationCode, method: 'email' });

		localStorage.setItem('twoFactorFeedback', getString(`twoFactorEmailView/${data.message}`));
		await setTwoFactorLocalStorage();
		// localStorage.setItem('state', 'security');
		throwRedirectionEvent('/profile');
	} catch (error) {
		document.querySelector('.feedbackInformation').innerHTML = getString(`twoFactorError/${error.message}`);
	}
}
