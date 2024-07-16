import rotatingGradient from "../anim/rotatingGradient.js";
import validateChangePasswordInputs from "../utils/changePasswordFormValidation.js";
import { managePasswordToggle } from "../utils/managePasswordInputVisibility.js";

export default () => {
	const html = `
		<section class="change-password-page">
			<div class="change-password-form-container-background"></div>
			<div class="change-password-form-container">
				<form>
					<h1>Change password</h1>
					<div class="form-fields">
						<input type="password" placeholder="Current password" name="current_password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="New password" name="new_password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="newPasswordFeedback" class="input-feedback"></span>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Confirm password" name="confirm_new_password" required>
						<i class="fa-solid fa-eye" id="password-eye"></i>
						<span id="confirmNewPasswordFeedback" class="input-feedback"></span>
					</div>
					<button-component id="saveBtn" label="Save" class="generic-auth-btn-disabled"></button-component>
				</form>
			</div>
		</section>
	`;

	setTimeout(() => {
		const saveBtn = document.querySelector('#saveBtn');

		saveBtn.addEventListener('click', event => {
			if (saveBtn.className === 'generic-auth-btn')
				postData(event, saveBtn);
		});

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