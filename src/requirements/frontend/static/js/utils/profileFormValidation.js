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
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	emailInput.addEventListener('input', () => {
		const emailValue = emailInput.value.trim();

		inputRequiredInfos.email = emailRegex.test(emailValue);
		updateEmailFeedback();
		checkValidity();
	});
}

export function updateEmailFeedback() {
	const feedbackElement = document.querySelector('#emailFeedback');
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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