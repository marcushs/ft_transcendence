export function managePasswordToggle() {
	const passwordEyeIcon = document.getElementById('password-eye');
	const passwordInput = document.querySelector('input[name="password"]');

	passwordEyeIcon.addEventListener('click', () => togglePasswordVisibility(passwordEyeIcon, passwordInput));
}

export function manageConfirmPasswordToggle() {
	const confirmPasswordEyeIcon = document.getElementById('confirm-password-eye');
	const confPasswordInput = document.querySelector('input[name="confirm_password"]');

	confirmPasswordEyeIcon.addEventListener('click', () => togglePasswordVisibility(confirmPasswordEyeIcon, confPasswordInput));
}


function togglePasswordVisibility(icon, input) {
	console.log(input)
	if (icon.classList.contains('fa-eye')) {
		icon.classList.replace('fa-eye', 'fa-eye-slash');
		input.type = 'text';
	}
	else {
		icon.classList.replace('fa-eye-slash', 'fa-eye');
		input.type = 'password';
	}
}
