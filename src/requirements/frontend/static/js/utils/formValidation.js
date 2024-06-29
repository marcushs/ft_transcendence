export function validateSignupInputs() {
	let isValid = { user: false, email: false, password: false, pwMatch: false };
	const btn = document.querySelector('button');
	const userInput = document.getElementById('uname');
	
	function checkValidity() {
		if ( Object.values(isValid).every(item => item == true))
			btn.disabled = false;
		else
			btn.disabled = true;
	}

	validateEmailInput(isValid, checkValidity);
	validatePasswordInput(isValid, checkValidity);
	confirmPasswordMatch(isValid, checkValidity);
	userInput.addEventListener('input', () => {
		if (userInput.value === '')
			isValid.user = false;
		else
			isValid.user = true;
		checkValidity();
	});
}

export function seePasswordToggle() {
	const pwEyeIcon = document.getElementById('password-eye');
	const pwInput = document.getElementById('password');

	pwEyeIcon.addEventListener('click', () => togglePasswordVisibility(pwEyeIcon, pwInput));
}

export function seeConfirmPasswordToggle() {
	const confPwEyeIcon = document.getElementById('confPassword-eye');
	const confPwInput = document.getElementById('confirm_password');

	confPwEyeIcon.addEventListener('click', () => togglePasswordVisibility(confPwEyeIcon, confPwInput));
}

function validateEmailInput(isValid, checkValidity) {
	const emailInput = document.getElementById('email');
	const feedbackElement = document.getElementById('emailFeedback');
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	emailInput.addEventListener('input', () => {
		const emailValue = emailInput.value.trim();

		feedbackElement.style.marginTop = '5px';
		feedbackElement.style.fontSize = '0.8rem';
		if (emailRegex.test(emailValue) )
			isValid.email = true;
		else 
			isValid.email = false;
		updateEmailFeedback();
		checkValidity();
	});
}

function validatePasswordInput(isValid, checkValidity) {
	const pwInput = document.getElementById('password');
	const feedbackElement = document.querySelector('password-feedback');
	const requirements = [
		{ regex: /.{8,}/, id: "charLen", isValid: false }, // Minimum of 8 characters
		{ regex: /[0-9]/, id: "num", isValid: false }, // At least one number
		{ regex: /[a-z]/, id: "lower", isValid: false }, // At least one lowercase letter
		{ regex: /[A-Z]/, id: "upper", isValid: false }, // At least one uppercase letter
		{ regex: /[^A-Za-z0-9]/, id: "specChar", isValid: false }, // At least one special character
	]
	
	pwInput.addEventListener('input', () => {
		// feedbackElement.show();
		if (pwInput.value === '')
			feedbackElement.hide();
		requirements.forEach(item => {
			item.regex.test(pwInput.value) ? item.isValid = true : item.isValid = false;
			feedbackElement.updatePasswordFeedbackDOM(requirements);
		});
		updateConfirmPasswordMatchFeedback(isValid);
		isValid.password = requirements.every(item => item.isValid);
		checkValidity();
	});
}

function confirmPasswordMatch(isValid, checkValidity) {
	const confPwInput = document.getElementById('confirm_password');
	confPwInput.addEventListener('input', () => {
		updateConfirmPasswordMatchFeedback(isValid)
		checkValidity();
	});
}

function togglePasswordVisibility(icon, input) {
	if (icon.classList.contains('fa-eye')) {
		icon.classList.replace('fa-eye', 'fa-eye-slash');
		input.type = 'text';
	}
	else {
		icon.classList.replace('fa-eye-slash', 'fa-eye');
		input.type = 'password';
	}
}

function updateConfirmPasswordMatchFeedback(isValid) {
	const pwValue = document.getElementById('password').value;
	const confPwValue = document.getElementById('confirm_password').value;
	const feedbackElement = document.getElementById('confPwFeedback');
	
	feedbackElement.style.marginTop = '5px';
	feedbackElement.style.fontSize = '0.8rem';
	if (confPwValue === '') {
		feedbackElement.textContent = '';
		isValid.pwMatch = false;
	} else if (pwValue === confPwValue) {
		feedbackElement.textContent = 'Password match!';
		feedbackElement.style.color = '#32CD32';
		isValid.pwMatch = true;
	} else {
		feedbackElement.textContent = "Password does not match.";
		feedbackElement.style.color = 'red';
		isValid.pwMatch = false;
	}
}

export function updateEmailFeedback() {
	const feedbackElement = document.getElementById('emailFeedback');
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const emailValue = document.getElementById('email').value;

	feedbackElement.style.marginTop = '5px';
	feedbackElement.style.fontSize = '0.8rem';
	if (emailValue === '')
		feedbackElement.textContent = '';
	else if (emailRegex.test(emailValue)) {
		feedbackElement.textContent = "Email is valid ✓"; // Email is valid
		feedbackElement.style.color = '#32CD32';
	} else {
		feedbackElement.textContent = "Please enter a valid email address.";
		feedbackElement.style.color = 'red';
	}
}