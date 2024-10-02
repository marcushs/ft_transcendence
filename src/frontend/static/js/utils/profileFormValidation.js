import { updateEmailFeedback } from "./formValidationUtils.js";

export default function validateUsernameInputs() {
	let inputRequiredInfos = { user: false, email: false };
	const userInput = document.querySelector('input[name="username"]');

	validateEmailInput(inputRequiredInfos);
	userInput.addEventListener('input', () => {
		if (userInput.value === '')
			inputRequiredInfos.user = false;
		else
			inputRequiredInfos.user = true;
	});
}

/* Email check */

function validateEmailInput(inputRequiredInfos) {
	const emailInput = document.querySelector('input[name="email"]');
	const feedbackElement = document.querySelector('#emailFeedback');
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'/;

	emailInput.addEventListener('input', () => {
		const emailValue = emailInput.value.trim();

		inputRequiredInfos.email = emailRegex.test(emailValue);
		updateEmailFeedback();
		checkValidity();
	});
}