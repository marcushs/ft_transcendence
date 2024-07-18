class SecurityComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `
			<div class="two-factor-container">
				<div class="title">
					<p>2Fa</p>
				</div>
				<div class="two-factor-email">
					<div class="two-factor-infos">					
						<p>2fa by email</p>
						<div class="two-factor-status">
							<div class="inactive-2fa"><i class="fa-solid fa-xmark"></i></div>
							<p>Inactive</p>
						</div>
					</div>
						<button-component label="Disable" class="generic-btn"></button-component>
				</div>
				<div class="two-factor-app">
					<div class="two-factor-infos">					
						<p>2fa by authenticator app</p>
						<div class="two-factor-status">
							<div class="active-2fa"><i class="fa-solid fa-check"></i></div>
							<p>Active</p>
						</div>
					</div>
					<button-component label="Disable" class="generic-btn"></button-component>
				</div>
			</div>
			<div class="change-password-container">
				<p>Change password</p>
			</div>
		`;
	}

	connectedCallback() {
	}


}

customElements.define('security-component', SecurityComponent);