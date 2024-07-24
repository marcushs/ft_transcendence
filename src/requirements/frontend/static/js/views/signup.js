import formWave from "../anim/formWave.js";
import "../components/CustomBtn.js";
import "../components/PasswordFeedback.js";
import "../components/NavBar.js";
import { validateSignupInputs, seePasswordToggle, seeConfirmPasswordToggle } from "../utils/formValidation.js";

export default () => {
	const html = `
		<nav-bar auth="false"></nav-bar>
		<div class="container">
			<h1>Signup Page</h1>
			<form>
				<div class="form-control">
					<input id="uname" type="text" name="username" required>
					<label>User Name</label>
				</div>

				<div class="form-control">
					<input id="email" type="text" name="email" required>
					<label>Email</label>
					<span id="emailFeedback"></span>
				</div>
		
				<div class="form-control">
					<input id="password" type="password" name="password" required>
					<label>Password</label>
					<i class="fa-solid fa-eye" id="password-eye"></i>
					<password-feedback active="true"></password-feedback>
					</div>
					
					<div class="form-control">
					<input id="confirm_password" type="password" name="confirm_password" required>
					<label>Confirm password</label>
					<i class="fa-solid fa-eye" id="confPassword-eye"></i>
					<span id="confPwFeedback"></span>
				</div>
		
				<button is="custom-btn" text="signup"></button>

				<button class="btn" id="oauthBtn" type="button">Signup with 42</button>		
			</form>	
		</div>
	`;

	setTimeout(() => {
		formWave();
		validateSignupInputs();
		seePasswordToggle();
		seeConfirmPasswordToggle();
		addStyleToView();
		oauthSignup();
	}, 0);

	return html;
}

function oauthSignup() {
	const oauthBtn = document.getElementById('oauthBtn');

	oauthBtn.addEventListener('click', async() => {
		try {
			const res = await fetch(`http://localhost:8000/account/oauth/signup/`);
			const data = await res.json();
			console.log(data);
			window.location.replace(data.url);
		} catch (error) {
			console.log(error);
		}
	});
}

function addStyleToView() {
    const cssLink = document.createElement('link');

    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', '../../style/views/signup.css');
    document.head.appendChild(cssLink);
}
