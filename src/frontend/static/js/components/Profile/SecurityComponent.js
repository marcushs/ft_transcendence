class SecurityComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `
			<div class="two-factor-container">
				<div class="title">
					<p>Two-factor authentication</p>
				</div>
				<p class="information-sentence">
					Help protect your account from unauthorized access by requiring a second authentication method
					in addition to your password.
				</p>
				<hr>
				<div class="two-factor-type">					
					<p>2fa by email</p>
					<div class="toggle-button">
						<div class="toggle-circle"></div>
					</div>
				</div>
				<hr>
				<div class="two-factor-type">					
					<p>2fa by app</p>
					<div class="toggle-button">
						<div class="toggle-circle"></div>
					</div>
				</div>
			</div>
			<span class="feedbackInformation" id="twoFactorFeedback"></span>
			<div class="change-password-container">
				<div class="title">
					<p>Change password</p>
				</div>
				<p class="information-sentence">
					Change your password regularly to keep your account secure.
				</p>
				<button-component label="Change" class="generic-btn" href="/change-password"></button-component>
			</div>
			<span class="feedbackInformation" id="passwordFeedback"></span>
		`;
	}


	connectedCallback() {
		console.log('test');
		this.displayFeedbackFromLocalStorage();
	}


	displayFeedbackFromLocalStorage() {
		const twoFactorFeedbackElement = this.querySelector('#twoFactorFeedback');
		const passwordFeedbackElement = this.querySelector('#passwordFeedback');
		const twoFactorResponse = localStorage.getItem('twoFactorFeedback');
		const passwordResponse = localStorage.getItem('passwordFeedback');

		console.log(passwordResponse)
		if (twoFactorResponse) {
			twoFactorFeedbackElement.innerHTML = twoFactorResponse;
			localStorage.removeItem('twoFactorFeedback');
		}

		if (passwordResponse) {
			passwordFeedbackElement.innerHTML = passwordResponse;
			localStorage.removeItem('passwordFeedback');
		}

	}

}

customElements.define('security-component', SecurityComponent);