import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import { setTwoFactorLocalStorage } from "../utils/setTwoFactorLocalStorage.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getString} from "../utils/languageManagement.js";
import { sendRequest } from "../utils/sendRequest.js";

export default async () => {
	await enableTwoFactorRequest();

	const html = `
		<section class="two-factor-app-page">
			<div class="two-factor-app-form-container-background"></div>
			<div class="two-factor-app-form-container">
				<form>
					<h1>${getString('twoFactorAppView/title')}</h1>
					<p>${getString('twoFactorAppView/paragraph')}</p>
		            <div id="qrcode"></div>
		            <div id="qrcode-token">
		                <p><strong>${getString('twoFactorAppView/key')}:</strong> ${sessionStorage.getItem('qrcode_token')}</p>
					</div>
		            <div class="form-fields">
		            	<two-factor-input-component></two-factor-input-component>
					</div>
					<p class="feedbackInformation"></p>
					<button-component label="verify" class="generic-auth-btn"></button-component>
				</form>
			</div>
		</section>
	`;

	setTimeout(() => {
		localStorage.setItem('state', 'security');
		rotatingGradient('.two-factor-app-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-app-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-app-form-container > form', '#1c0015', '#001519');

		document.querySelector('form').addEventListener('submit', (event) => {
			event.preventDefault();
			const inputs = [...event.target.querySelectorAll('input')];
			const verificationCode = inputs.reduce((acc, input) => acc += input.value, '');
			VerifyTwoFactorRequest(verificationCode);
		});

		displayQRCode();
	}, 0);

	return html;
}

function displayQRCode() {
	const qrCodeElement = document.getElementById('qrcode');
	const qrCodeUri = sessionStorage.getItem('qrcodeuri');

	new QRCode(qrCodeElement, qrCodeUri);
}

async function enableTwoFactorRequest() {
	try {
		const data = await sendRequest('POST', '/api/twofactor/enable/', { method: 'authenticator' })
		sessionStorage.setItem('qrcodeuri', data.qrcode);
		sessionStorage.setItem('qrcode_token', data.qrcode_token);
	} catch (error) {
		console.error('Error with qrcode render display: ', error);
		throwRedirectionEvent('/');
	}
}

async function VerifyTwoFactorRequest(verificationCode) {
	try {
		const payload = {
			method: 'authenticator',
			twofactor: verificationCode
		}
		const data = await sendRequest('POST', '/api/twofactor/enable/', payload)
		localStorage.setItem('twoFactorFeedback', getString(`twoFactorAppView/${data.message}`));
		await setTwoFactorLocalStorage();
		throwRedirectionEvent('/profile');
	} catch (error) {
		document.querySelector('.feedbackInformation').innerHTML = getString(`twoFactorError/${error.message}`);
	}
}
