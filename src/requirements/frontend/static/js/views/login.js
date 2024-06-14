import formWave from "../anim/formWave.js";
import "../components/CustomBtn.js"

export default () => {
	const html = `
	<div class="container">
		<h1>Please Login</h1>
		<form>
			<div class="form-control">
				<input type="text" name="username" required>
				<label>Username</label>
			</div>

			<div class="form-control">
				<input type="password" name="password" required>
				<label>Password</label>
			</div>

			<button is="custom-btn" text="Login"></button>

			<p class="text">Don't have an account? <a href="/signup">Register</a></p>
		</form>
	</div>`;

	setTimeout(() => {
		formWave();
	}, 0);

	return html;
}
