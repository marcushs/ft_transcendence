export default function validateSignupInputs() {
	let inputRequiredInfos = { user: false, email: false, password: false, passwordMatch: false };
	const btn = document.querySelector('.generic-auth-btn-disabled');
	const userInput = document.querySelector('input[name="username"]');

	function checkValidity() {
		if ( Object.values(inputRequiredInfos).every(item => item === true))
			btn.className = 'generic-auth-btn';
		else
			btn.className = 'generic-auth-btn-disabled';
	}

	validateEmailInput(inputRequiredInfos, checkValidity);
	validatePasswordInput(inputRequiredInfos, checkValidity);
	confirmPasswordMatch(inputRequiredInfos, checkValidity);
	userInput.addEventListener('input', () => {
		if (userInput.value === '')
			inputRequiredInfos.user = false;
		else
			inputRequiredInfos.user = true;
		checkValidity();
	});
}

function validateEmailInput(inputRequiredInfos, checkValidity) {
	const emailInput = document.querySelector('input[name="email"]');
	const feedbackElement = document.querySelector('#emailFeedback');
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	emailInput.addEventListener('input', () => {
		const emailValue = emailInput.value.trim();

		inputRequiredInfos.email = emailRegex.test(emailValue);
		updateEmailFeedback();
		checkValidity();
	});
}

function updateEmailFeedback() {
	const feedbackElement = document.querySelector('#emailFeedback');
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const emailValue = document.querySelector('input[name="email"]').value;

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


/* Password check */

function validatePasswordInput(inputRequiredInfos, checkValidity) {
	const passwordInput = document.querySelector('input[name="password"]');
	const feedbackElement = document.querySelector('#passwordFeedback');
	const passwordRequirements = [
		{ regex: /.{8,}/, id: "charLen", isValid: false },
		{ regex: /[0-9]/, id: "num", isValid: false },
		{ regex: /[a-z]/, id: "lower", isValid: false },
		{ regex: /[A-Z]/, id: "upper", isValid: false },
		{ regex: /[^A-Za-z0-9]/, id: "specChar", isValid: false }
	]

	passwordInput.addEventListener('input', () => {
		if (passwordInput.value === '')
			feedbackElement.textContent = '';
		passwordRequirements.forEach(item => {
			item.regex.test(passwordInput.value) ? item.isValid = true : item.isValid = false;
		});
		inputRequiredInfos.password = passwordRequirements.every(item => item.isValid);
		updatePasswordFeedback(inputRequiredInfos, passwordRequirements);
		updateConfirmPasswordMatchFeedback(inputRequiredInfos);
		checkValidity();
	});
}

function updatePasswordFeedback(inputRequiredInfos, passwordRequirements) {
	const feedbackElement = document.querySelector('#passwordFeedback');
	const passwordValue = document.querySelector('input[name="password"]').value;
	let isValidPassword;


	if (passwordValue === '')
		feedbackElement.textContent = '';
	else if (inputRequiredInfos.password) {
		feedbackElement.textContent = "Password is valid ✓"; // Email is valid
		feedbackElement.style.color = '#32CD32';
	} else {
		feedbackElement.textContent = "The password must contain at least 8 characters, 1 number, 1 uppercase letter and 1 special symbol.";
		feedbackElement.style.color = 'red';
	}
}

/* Confirm password check */

function confirmPasswordMatch(inputRequiredInfos, checkValidity) {
	const confPwInput = document.querySelector('input[name="confirm_password"]');
	confPwInput.addEventListener('input', () => {
		updateConfirmPasswordMatchFeedback(inputRequiredInfos)
		checkValidity();
	});
}

function updateConfirmPasswordMatchFeedback(inputRequiredInfos) {
	const passwordValue = document.querySelector('input[name="password"]').value;
	const confirmPasswordValue = document.querySelector('input[name="confirm_password"]').value;
	const feedbackElement = document.querySelector('#confirmPasswordFeedback');

	if (confirmPasswordValue === '') {
		feedbackElement.textContent = '';
		inputRequiredInfos.passwordMatch = false;
	} else if (passwordValue === confirmPasswordValue) {
		feedbackElement.textContent = 'Password match!';
		feedbackElement.style.color = '#32CD32';
		inputRequiredInfos.passwordMatch = true;
	} else {
		feedbackElement.textContent = "Password does not match.";
		feedbackElement.style.color = 'red';
		inputRequiredInfos.passwordMatch = false;
	}
}