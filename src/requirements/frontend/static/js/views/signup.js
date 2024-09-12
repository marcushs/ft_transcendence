// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js";
import rotatingGradient from "../anim/rotatingGradient.js";
import { getCookie } from "../utils/cookie.js";
import validateSignupInputs from "../utils/signupFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";

export default () => {
	const html = `
		<section class="signup-page">
			<div class="signup-form-container-background"></div>
			<div class="signup-form-container">
				<form>
					<h1>Signup</h1>
					<div class="form-fields">
						<input type="text" placeholder="Username" name="username" required>
					</div>
					<div class="form-fields">
						<input type="text" placeholder="Email" name="email" autofocus required>
						<span id="emailFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" name="password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="passwordFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Confirm password" name="confirm_password" required>
						<i class="fa-solid fa-eye" id="confirm-password-eye"></i>
						<span id="confirmPasswordFeedback" class="input-feedback"></span>
					</div>
					<button-component id="signupBtn" label="Signup" class="generic-auth-btn-disabled"></button-component>
					<p>Already have an account? <a href="/login">Login</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		const signupBtn = document.querySelector('#signupBtn');

		signupBtn.addEventListener('click', event => {
			if (signupBtn.className === 'generic-auth-btn')
				postData(event, signupBtn);
		});

		rotatingGradient('.signup-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.signup-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.signup-form-container > form', '#1c0015', '#001519');
		validateSignupInputs();
		managePasswordToggle('password');
		managePasswordToggle('confirm_password');
	}, 0);

	return html;
}

function showAlreadyExistsData(message) {
	alert(message);
}

async function postData(event, signupBtn) {
	// Prevent form submission
	event.preventDefault();
	// Get the closest form element of the button
	const form = signupBtn.closest('form');
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
			const res = await fetch(`/api/auth/signup/`, config);
			if (res.status == 403)
				throw new Error('Access Denied')
			const data = await res.json();
			if (data.error)
				alert(data.error)
			else
				window.location.replace(data.redirect_url);
		} catch (error) {
			if (error.data && error.data.status === 'jwt_failed') {
				history.replaceState("", "", "/");
				document.title = "Index";
				app.innerHTML = index();
			}
			// console.log('Catch error :', error);
			showAlreadyExistsData(error.message);
		}
	} else {
		console.error('No form found!');
	}
}
