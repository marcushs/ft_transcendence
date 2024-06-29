import './ButtonComponent.js'

class AuthenticationRegisterComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<form>
				<h1>Register</h1>
				<div class="form-fields">
					<input type="text" placeholder="Username" maxlength="12" required>
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

				<button-component label="Register" class="generic-btn"></button-component>
				<p>Already have an account? <span>Login</span></p>
			</form>
		`
	}
}

customElements.define('authentication-register-component', AuthenticationRegisterComponent)