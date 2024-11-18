import {getString} from "./languageManagement.js";

export default function validateChangePasswordInputs() {
	let inputRequiredInfos = { password: false, newPassword: false, newPasswordMatch: false };
	const passwordInput = document.querySelector('input[type="password"]');
	const btn = document.querySelector('.generic-auth-btn-disabled');

	function checkValidity() {
		if ( Object.values(inputRequiredInfos).every(item => item === true))
			btn.className = 'generic-auth-btn';
		else
			btn.className = 'generic-auth-btn-disabled';
	}

	passwordInput.addEventListener('input', () => {
		(passwordInput.value !== '') ? inputRequiredInfos.password = true : inputRequiredInfos.password = false;
		checkValidity();
	})
	validateNewPasswordInput(inputRequiredInfos, checkValidity);
	confirmNewPasswordMatch(inputRequiredInfos, checkValidity);
}

/* Password check */

function validateNewPasswordInput(inputRequiredInfos, checkValidity) {
	const newPasswordInput = document.querySelector('input[name="new_password"]');
	const feedbackElement = document.querySelector('#newPasswordFeedback');
	const passwordRequirements = [
		{ regex: /.{8,}/, id: "charLen", isValid: false },
		{ regex: /[0-9]/, id: "num", isValid: false },
		{ regex: /[a-z]/, id: "lower", isValid: false },
		{ regex: /[A-Z]/, id: "upper", isValid: false },
		{ regex: /[^A-Za-z0-9]/, id: "specChar", isValid: false }
	]

	newPasswordInput.addEventListener('input', () => {
		if (newPasswordInput.value === '')
			feedbackElement.textContent = '';
		passwordRequirements.forEach(item => {
			item.regex.test(newPasswordInput.value) ? item.isValid = true : item.isValid = false;
		});
		inputRequiredInfos.newPassword = passwordRequirements.every(item => item.isValid);
		updateNewPasswordFeedback(inputRequiredInfos, passwordRequirements);
		updateConfirmNewPasswordMatchFeedback(inputRequiredInfos);
		checkValidity();
	});
}

function updateNewPasswordFeedback(inputRequiredInfos, passwordRequirements) {
	const feedbackElement = document.querySelector('#newPasswordFeedback');
	const passwordValue = document.querySelector('input[name="new_password"]').value;

	if (passwordValue === '')
		feedbackElement.textContent = '';
	else if (inputRequiredInfos.newPassword) {
		feedbackElement.textContent = getString('loginView/validPreviewPassword');
		feedbackElement.style.color = '#32CD32';
	} else {
		feedbackElement.textContent = getString('loginView/invalidPreviewPassword');
		feedbackElement.style.color = 'red';
	}
}

/* Confirm password check */

function confirmNewPasswordMatch(inputRequiredInfos, checkValidity) {
	const confPwInput = document.querySelector('input[name="confirm_new_password"]');
	confPwInput.addEventListener('input', () => {
		updateConfirmNewPasswordMatchFeedback(inputRequiredInfos)
		checkValidity();
	});
}

function updateConfirmNewPasswordMatchFeedback(inputRequiredInfos) {
	const newPasswordValue = document.querySelector('input[name="new_password"]').value;
	const confirmNewPasswordValue = document.querySelector('input[name="confirm_new_password"]').value;
	const feedbackElement = document.querySelector('#confirmNewPasswordFeedback');

	if (confirmNewPasswordValue === '') {
		feedbackElement.textContent = '';
		inputRequiredInfos.newPasswordMatch = false;
	} else if (newPasswordValue === confirmNewPasswordValue) {
		feedbackElement.textContent = getString('loginView/passwordMatch');
		feedbackElement.style.color = '#32CD32';
		inputRequiredInfos.newPasswordMatch = true;
	} else {
		feedbackElement.textContent = getString('loginView/passwordNotMatch');
		feedbackElement.style.color = 'red';
		inputRequiredInfos.newPasswordMatch = false;
	}
}