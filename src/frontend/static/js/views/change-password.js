import rotatingGradient from "../anim/rotatingGradient.js";
import validateChangePasswordInputs from "../utils/changePasswordFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getString} from "../utils/languageManagement.js";
import {sendRequest} from "../utils/sendRequest.js";
import {getCookie} from "../utils/cookie.js";

export default () => {
	const html = `
		<section class="change-password-page">
			<div class="change-password-form-container-background"></div>
			<div class="change-password-form-container">
				<form>
					<h1>${getString('changePasswordView/changePasswordTitle')}</h1>
					<div class="form-fields">
						<input type="password" placeholder="${getString('changePasswordView/currentPassword')}" name="current_password" autofocus required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="currentPasswordFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="${getString('changePasswordView/newPassword')}" name="new_password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="newPasswordFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="${getString('changePasswordView/confirmPassword')}" name="confirm_new_password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="confirmNewPasswordFeedback" class="input-feedback"></span>
					</div>
					<button-component id="saveBtn" label="save" class="generic-auth-btn-disabled"></button-component>
				</form>
			</div>
		</section>
	`;

	setTimeout(() => {
		localStorage.setItem('state', 'security');
		const saveBtn = document.querySelector('#saveBtn');

		saveBtn.addEventListener('click', (event) => {
			event.preventDefault();
			handleClickOnSaveBtn(saveBtn);
		});

		displayFeedbackFromLocalStorage();
		document.querySelector('input[name="current_password"]').addEventListener('input', (event) => handleInputChange(event));

		rotatingGradient('.change-password-form-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.change-password-form-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.change-password-form-container > form', '#1c0015', '#001519');
		validateChangePasswordInputs();
		managePasswordToggle('current_password');
		managePasswordToggle('new_password');
		managePasswordToggle('confirm_new_password');
	}, 0);

	return html;
}


function handleInputChange(event) {
	const feedbackElement = event.target.parentElement.querySelector('#currentPasswordFeedback');

	if (feedbackElement.innerHTML === 'Incorrect current password')
		feedbackElement.innerHTML = '';
}


function handleClickOnSaveBtn(saveBtn) {
	const formData = new FormData();
	const password = document.querySelector('input[name="current_password"]');
	const newPassword = document.querySelector('input[name="new_password"]');
	const confirmNewPassword = document.querySelector('input[name="confirm_new_password"]');

	if (saveBtn.className === 'generic-auth-btn') {
		formData.append(password.name, password.value);
		formData.append(newPassword.name, newPassword.value);
		formData.append(confirmNewPassword.name, confirmNewPassword.value);
		postNewPassword(formData);
	}
}

function displayFeedbackFromLocalStorage() {
	try {
		const response = JSON.parse(localStorage.getItem('userUpdateResponse'));

		if (response) {
			showFeedback(response);
			localStorage.removeItem('userUpdateResponse');
		}
	} catch (e) {}
}

function showFeedback(response) {
	const currentPasswordFeedbackElement = document.querySelector('#currentPasswordFeedback');
	const newPasswordFeedbackElement = document.querySelector('#newPasswordFeedback');
	const confirmNewPasswordFeedbackElement = document.querySelector('#confirmNewPasswordFeedback');

	if (response['current_password'])
		currentPasswordFeedbackElement.textContent = getString(`changePasswordView/${response['current_password']}`);
	if (response['new_password'])
		newPasswordFeedbackElement.textContent = getString(`changePasswordView/${response['new_password']}`);
	if (response['confirm_new_password'])
		confirmNewPasswordFeedbackElement.textContent = getString(`changePasswordView/${response['confirm_new_password']}`);
}

async function postNewPassword(formData) {
	const url = `/api/auth/change-password/`;

	try {
		const data = await sendRequest('POST', url, formData, true);

		if (data.status === 'success') {
			localStorage.setItem('state', 'security');
			localStorage.setItem('passwordFeedback', getString("changePasswordView/passwordSuccessfullyChanged"));
			throwRedirectionEvent('/profile');
		} else {
			console.log(data);
			localStorage.setItem('userUpdateResponse', JSON.stringify(data));
			throwRedirectionEvent('/change-password');
		}
	} catch (error) {
		console.error(error);
	}
}
