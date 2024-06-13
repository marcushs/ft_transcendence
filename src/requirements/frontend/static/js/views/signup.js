import formWave from "../anim/formWave.js";
import "../components/CustomBtn.js";
import "../components/PasswordFeedback.js";

function validateEmailInput() {
	const emailInput = document.getElementById('email');
	const feedbackElement = document.getElementById('emailFeedback');
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	emailInput.addEventListener('input', () => {
		const emailValue = emailInput.value;

		feedbackElement.style.marginTop = '5px';
		feedbackElement.style.fontSize = '0.8rem';
		if (emailValue === '')
			feedbackElement.textContent = '';
        else if (emailRegex.test(emailValue)) {
            feedbackElement.textContent = "Email is valid ✓"; // Email is valid
            feedbackElement.style.color = '#32CD32';
			return true;
        } else {
			feedbackElement.textContent = "Please enter a valid email address.";
            feedbackElement.style.color = 'red';
		}
		return false;
	});
}

function validatePasswordInput() {
	const pwInput = document.getElementById('password');
	const feedbackElement = document.getElementById('passwordFeedback');

	pwInput.addEventListener('input', () => {
		const pwValue = pwInput.value;
		
	});
}

export default () => {
	const html = `
		<div class="container">
			<h1>Signup Page</h1>
			<form>
				<div class="form-control">
					<input id="uname" type="text" name="user_name" required>
					<label>User Name</label>
				</div>

				<div class="form-control">
					<input id="email" type="email" name="email" required>
					<label>Email</label>
					<span id="emailFeedback"></span>
				</div>
		
				<div class="form-control">
					<input id="password" type="password" name="password" required>
					<label>Password</label>
					<password-feedback></password-feedback>
				</div>
		
				<div class="form-control">
					<input id="confirm_password" type="password" name="confirm_password" required>
					<label>Confirm password</label>
				</div>
		
				<button is="custom-btn" text="Signup"></button>
		
			</form>	
		</div>
	`;

	setTimeout(() => {
		formWave()
		validateEmailInput();
	}, 0);

	return html;
}


