import '../components/two_factor_auth/TwoFactorEnableComponent.js';
import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import '../components/ButtonComponent.js';
import '../components/two_factor_auth/TwoFactorInputComponent.js';
import getUserData from "../utils/getUserData.js";

export default () => {
	enableTwoFactorRequest();

	const html = `
		<section class="two-factor-email-page">
			<div class="two-factor-email-form-container-background"></div>
			<div class="two-factor-email-form-container">
				<form>
					<h1>Enable 2fa by email</h1>
					<p>
						To enable 2fa, please enter the code you received at the following email:
					</p>
					<p><strong></strong></p>
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
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		},
		credentials: 'include',
		body: JSON.stringify({ method: 'email' })
	};

	const res = await fetch(`http://localhost:8002/twofactor/enable/`, config);

	if (res.status === 403)
		return res.status;

	const data = await res.json();

	if (res.status === 200) {

		//redirect
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
			method: 'email',
		})
	}
	const res = await fetch(`http://localhost:8002/twofactor/enable/`, config);
	if (res.status === 403)
		throw new Error('Access Denied')
	const data = await res.json();
	if (res.status === 200) {
		console.log('enable backend response: ', data.message)
	} else
		document.querySelector('.feedbackInformation').innerHTML = data.message;
}