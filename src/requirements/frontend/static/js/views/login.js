import formWave from "../anim/formWave.js";
import "../components/CustomBtn.js";
import "../components/NavBar.js";
import { seePasswordToggle } from "../utils/formValidation.js";
import { checkFieldsCompleted } from "../utils/loginFormValidation.js";

export default () => {
	const html = `
	<nav-bar auth="false"></nav-bar>
	<div class="container">
		<h1>Please Login</h1>
		<form>
			<div class="form-control">
				<input type="text" id="username" name="username" required>
				<label>Username</label>
			</div>

			<div class="form-control">
				<input type="password" id="password" name="password" required>
				<label>Password</label>
				<i class="fa-solid fa-eye" id="password-eye"></i>
			</div>

			<button is="custom-btn" text="Login"></button>

			<p class="text">Don't have an account? <a href="/signup">Register</a></p>
		</form>
	</div>`;

	setTimeout(() => {
		formWave();
		checkFieldsCompleted();
		seePasswordToggle();
	}, 0);

	return html;
}
