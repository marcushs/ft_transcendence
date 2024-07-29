// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import loginFormValidation from "../utils/loginFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";
import {TwoFactorVerify} from './two-factor-verify.js';
// import {TwoFactorVerify} from "./two_factor/TwoFactorLoginVerify.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";

export default () => {
	const html = `
		<section class="login-page">
			<div class="login-form-container-background"></div>
			<div class="login-form-container">
				<form>
					<h1>Login</h1>
					<div class="form-fields">
						<input type="text" placeholder="Username" name="username" autofocus required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" name="password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<a href="/change-password" id="forgotten-password">Forgotten password?</a>
					</div>
					<button-component id="loginBtn" label="Login" class="generic-auth-btn-disabled"></button-component>
					<p>Don't have an account? <a href="/signup">Signup</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(async () => {
		const loginBtn = document.querySelector('#loginBtn');

		loginBtn.addEventListener('click', event => {
			if (loginBtn.className === 'generic-auth-btn')
				postData(event, loginBtn);
		});

		rotatingGradient('.login-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.login-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.login-form-container > form', '#1c0015', '#001519');
		loginFormValidation();
		managePasswordToggle('password');
	}, 0);

	return html;
}

async function postData(event, loginBtn) {
	event.preventDefault();
	const form = loginBtn.closest('form');
	if (form) {
		const formData = new FormData(form);

		const formValues = Object.fromEntries(formData.entries());
		const json = JSON.stringify(formValues);
		const config = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
			},
			credentials: 'include', // Needed for send cookie
			body: json, // Send form values as JSON
		};

		try {
			const res = await fetch(`http://localhost:8001/auth/login/`, config);
			if (res.status == 403)
				throw new Error('Access Denied')
			const data = await res.json();
			if (res.status === 200) {
				if (data.is_verified === true)
					new TwoFactorVerify(JSON.parse(json));
					// new TwoFactorVerify(json);
				else
					throwRedirectionEvent('/');
			} else {
				console.log(data.message)
			}
		} catch (error) {
			if (error.data && error.data.status === 'jwt_failed')
				throwRedirectionEvent('/')
			console.log('Catch error :', error);
		}
	} else {
		console.error('No form found!');
	}
}