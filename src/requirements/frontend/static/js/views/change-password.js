import rotatingGradient from "../anim/rotatingGradient";
import loginFormValidation from "../utils/loginFormValidation";
import {managePasswordToggle} from "../utils/managePasswordInputVisibility";

export default () => {
	const html = `
	<section class="login-page">
		<div class="login-form-container-background"></div>
		<div class="login-form-container">
			<form>
				<h1>Change password</h1>
				<div class="form-fields">
					<input type="password" placeholder="Password" name="username" required>
					<i class="fa-solid fa-eye" id="password-eye"></i>
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
		managePasswordToggle();
	}, 0);

	return html;
}