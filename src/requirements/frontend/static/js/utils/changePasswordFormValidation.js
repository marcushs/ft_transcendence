export default function validateChangePasswordInputs() {
	let inputRequiredInfos = { user: false, email: false, password: false, passwordMatch: false };
	const btn = document.querySelector('.generic-auth-btn-disabled');

	function checkValidity() {
		if ( Object.values(inputRequiredInfos).every(item => item === true))
			btn.className = 'generic-auth-btn';
		else
			btn.className = 'generic-auth-btn-disabled';
	}

	validatePasswordInput(inputRequiredInfos, checkValidity);
	confirmPasswordMatch(inputRequiredInfos, checkValidity);
}

/* Password check */

function validatePasswordInput(inputRequiredInfos, checkValidity) {
	const passwordInput = document.querySelector('input[name="new_password"]');
	const feedbackElement = document.querySelector('#newPasswordFeedback');
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
	const feedbackElement = document.querySelector('#newPasswordFeedback');
	const passwordValue = document.querySelector('input[name="new_password"]').value;
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
	const confPwInput = document.querySelector('input[name="confirm_new_password"]');
	confPwInput.addEventListener('input', () => {
		updateConfirmPasswordMatchFeedback(inputRequiredInfos)
		checkValidity();
	});
}

function updateConfirmPasswordMatchFeedback(inputRequiredInfos) {
	const passwordValue = document.querySelector('input[name="new_password"]').value;
	const confirmPasswordValue = document.querySelector('input[name="confirm_new_password"]').value;
	const feedbackElement = document.querySelector('#confirmNewPasswordFeedback');

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