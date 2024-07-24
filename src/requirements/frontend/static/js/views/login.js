// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import loginFormValidation from "../utils/loginFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";
import { TwoFactorVerify } from './two_factor/TwoFactorLoginVerify.js'

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

	setTimeout(() => {
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
	// Prevent form submission
	event.preventDefault();
	// Get the closest form element of the button
	const form = loginBtn.closest('form');
	if (form) {
		// Construct a FormData object, a set of key/value pairs
		const formData = new FormData(form);
		// formData.entries() return an iterator that traverse all the key/value pairs
		// Object.fromEntries() transforms a list of key-value pairs into an object

		const formValues = Object.fromEntries(formData.entries());
		const json = JSON.stringify(formValues);
		console.log(json)
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
			console.log(config)
			const res = await fetch(`http://localhost:8001/auth/login/`, config);
			if (res.status == 403)
				throw new Error('Access Denied')
			const data = await res.json();
			if (res.status === 200) {
				if (data.is_verified === true)
					new TwoFactorVerify(json);
				alert(data.message)
			}
			if (data.error)
				alert(data.error)
		} catch (error) {
			if (error.data && error.data.status === 'jwt_failed') {
				history.replaceState("", "", "/");
				document.title = "Index";
				app.innerHTML = index();
			}
			console.log('Catch error :', error);
			alert(`Error: ${error.message}`)
		}
	} else {
		console.error('No form found!');
	}
}