import './ButtonComponent.js'

class AuthenticationLoginComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<form>
				<h1>Sign in</h1>
				<div class="form-fields">
					<input type="text" placeholder="Email" required>
				</div>
				<div class="form-fields">
					<input type="password" placeholder="Password" required>
				</div>
<!--				<button-component label="Sign in" class="generic-btn"></button-component>-->
				<p>Don't have an account? <span>Register</span></p>
			</form>
		`
	}
}

customElements.define('authentication-login-component', AuthenticationLoginComponent)