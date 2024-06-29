// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const html = `
		<section class="signup-page">
			<div class="signup-form-container-background"></div>
			<div class="signup-form-container">			
				<form>
					<h1>Signup</h1>
					<div class="form-fields">
						<input type="text" placeholder="Username" required>
					</div>
					<div class="form-fields">
						<input type="text" placeholder="Email" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Confirm password" required>
					</div>
					<button-component label="Signup" class="special-btn"></button-component>
					<p>Already have an account? <a href="/login">Login</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		rotatingGradient('.signup-form-container-background');
		rotatingGradient('.signup-form-container');
	}, 0);

	return html;
}
