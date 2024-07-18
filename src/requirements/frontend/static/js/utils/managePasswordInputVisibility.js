export function managePasswordToggle(inputName) {
	const passwordInput = document.querySelector(`input[name="${inputName}"]`);
	const passwordEyeIcon = passwordInput.parentElement.querySelector('i');

	console.log(passwordInput.parentElement)
	passwordEyeIcon.addEventListener('click', () => togglePasswordVisibility(passwordEyeIcon, passwordInput));
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
