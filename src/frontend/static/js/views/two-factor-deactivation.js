import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {isTwoFactorActivated} from "../utils/isTwoFactorActivated.js";
import {getString} from "../utils/languageManagement.js";

export default () => {
	const html  = `
		<section class="two-factor-deactivation-page">
			<div class="two-factor-deactivation-form-container-background"></div>
			<div class="two-factor-deactivation-form-container">
				<form>
					${renderViewByMethod(localStorage.getItem('twoFactorMethod'), localStorage.getItem('changeTwoFactorMethod') === 'true')}
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
		const userData = await getUserData();

		document.querySelector('form').addEventListener('submit', (event) => handleSubmit(event));

		const userEmail = document.querySelector('p > strong');
		if (userEmail)
			userEmail.innerHTML = userData.email;

		rotatingGradient('.two-factor-deactivation-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-deactivation-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.two-factor-deactivation-form-container > form', '#1c0015', '#001519');
	}, 0);

	return html;
}


function handleSubmit(event) {
		event.preventDefault();
		const inputs = [...event.target.querySelectorAll('input')];
		const verificationCode = inputs.reduce((acc, input) => acc += input.value, '');
		DeactivateTwoFactorRequest(verificationCode);
}


function renderViewByMethod(authenticationMethod, changeTwoFactorMethod=false) {
	const emailStr = getString('twoFactorDeactivationView/email');
	const authenticatorStr = getString('twoFactorDeactivationView/authenticator');
	const title = `<h1>${getString('twoFactorDeactivationView/title')} ${(authenticationMethod === 'email') ? emailStr : authenticatorStr}</h1>`;
	let disableMessage = (authenticationMethod === 'email') ? getString('twoFactorDeactivationView/disableEmail') : getString('twoFactorDeactivationView/disableAuthenticator');
	let message;

	if (authenticationMethod === 'email') {
		sendTwoFactorCode();
	}
	if (changeTwoFactorMethod) {
		message = `
			<p>
				${getString('twoFactorDeactivationView/disableDisclaimerPrefix')} ${(authenticationMethod === 'email') ? authenticatorStr : emailStr}, ${getString('twoFactorDeactivationView/disableDisclaimerSuffix')} ${(authenticationMethod === 'email') ? emailStr : authenticatorStr}.
				${getString('twoFactorDeactivationView/disableExplication')} ${disableMessage}
			</p>
		`;
		if (authenticationMethod === 'email')
			message += `<p><strong></strong></p>`
	} else if (authenticationMethod === 'email') {
		message = `
			<p>
				${getString('twoFactorDeactivationView/disableExplication')} ${disableMessage}
			</p>
			<p><strong></strong></p>
		`;
	} else {
		message = `
			<p>
				${getString('twoFactorDeactivationView/disableExplication')} ${disableMessage}
			</p>
		`;
	}

	return title + message;
}

async function removeTwoFactorLocalStorage() {
	localStorage.setItem('isTwoFactorActivated', 'false');
	localStorage.removeItem('twoFactorMethod');
	localStorage.setItem('changeTwoFactorMethod', 'false');
}

async function sendTwoFactorCode() {
	const config = {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
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

async function DeactivateTwoFactorRequest(verificationCode) {
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
		body: JSON.stringify({
			twofactor: verificationCode
		})
	}
	console.log(config)
	const res = await fetch('http://localhost:8002/twofactor/disable/', config);
	if (res.status === 403)
		throw new Error('Access Denied')
	const data = await res.json();
	if (res.status === 200) {
		if (localStorage.getItem('changeTwoFactorMethod') === 'true') {
			if (localStorage.getItem('twoFactorMethod') === 'email')
				throwRedirectionEvent('/two-factor-app');
			else
				throwRedirectionEvent('/two-factor-email');
		} else {
			localStorage.setItem('twoFactorFeedback', data.message);
			localStorage.setItem('state', 'security');
			throwRedirectionEvent('/profile');
		}
		removeTwoFactorLocalStorage();
	} else
		document.querySelector('.feedbackInformation').innerHTML = data.message;
}