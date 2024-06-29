// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const html = `
		<section class="login-page">
			<div class="login-form-container-background"></div>
			<div class="login-form-container">			
				<form>
					<h1>Login</h1>
					<div class="form-fields">
						<input type="text" placeholder="Email" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" required>
					</div>
					<button-component label="Login" class="special-btn"></button-component>
					<p>Don't have an account? <a href="/signup">Signup</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		rotatingGradient('.login-form-container-background');
		rotatingGradient('.login-form-container');
	}, 0);

	return html;
}
