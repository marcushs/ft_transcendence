import formWave from "../anim/formWave.js";
import "../components/CustomBtn.js";
import "../components/PasswordFeedback.js";
import { validateInputs, seePasswordToggle } from "../utils/signupFormValidation.js";

export default () => {
	const html = `
		<div class="container">
			<h1>Signup Page</h1>
			<form>
				<div class="form-control">
					<input id="uname" type="text" name="user_name" required>
					<label>User Name</label>
				</div>

				<div class="form-control">
					<input id="email" type="text" name="email" required>
					<label>Email</label>
					<span id="emailFeedback"></span>
				</div>
		
				<div class="form-control">
					<input id="password" type="password" name="password" required>
					<label>Password</label>
					<i class="fa-solid fa-eye" id="password-eye"></i>
					<password-feedback active="true"></password-feedback>
					</div>
					
					<div class="form-control">
					<input id="confirm_password" type="password" name="confirm_password" required>
					<label>Confirm password</label>
					<i class="fa-solid fa-eye" id="confPassword-eye"></i>
					<span id="confPwFeedback"></span>
				</div>
		
				<button is="custom-btn" text="Signup"></button>
		
			</form>	
		</div>
	`;

	setTimeout(() => {
		formWave();
		validateInputs();
		seePasswordToggle();
	}, 0);

	return html;
}


