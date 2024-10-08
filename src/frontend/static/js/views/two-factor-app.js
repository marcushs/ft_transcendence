import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import { setTwoFactorLocalStorage } from "../utils/setTwoFactorLocalStorage.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getString} from "../utils/languageManagement.js";

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
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		},
		credentials: 'include',
		body: JSON.stringify({ method: 'authenticator' })
	};

	const res = await fetch(`http://localhost:8002/twofactor/enable/`, config);

	if (res.status === 403)
		return res.status;

	const data = await res.json();

	if (res.status === 200) {
		if (data.qrcode) {
			sessionStorage.setItem('qrcodeuri', data.qrcode);
			sessionStorage.setItem('qrcode_token', data.qrcode_token);
			return res.status;
		}
	} else {
		throw new Error(data.message);
	}
}

async function VerifyTwoFactorRequest(verificationCode) {
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
			method: 'authenticator',
		})
	}
	const res = await fetch(`http://localhost:8002/twofactor/enable/`, config);
	if (res.status === 403)
		throw new Error('Access Denied')
	const data = await res.json();
	if (res.status === 200) {
		localStorage.setItem('twoFactorFeedback', data.message);
		await setTwoFactorLocalStorage();
		// localStorage.setItem('state', 'security');
		throwRedirectionEvent('/profile');
	} else
		document.querySelector('.feedbackInformation').innerHTML = data.message;
}