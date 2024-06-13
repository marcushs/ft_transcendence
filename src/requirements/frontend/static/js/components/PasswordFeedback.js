class PasswordFeedback extends HTMLElement {
	static get observedAttributes() {
        return ["active"];
    }

	constructor() {
		super();

		this.innerHTML = `
			<div class="password-feedback">
				<h3 class="feedback-title">Password should be</h3>

				<ul class="feedback">
					<li class="list-item">At least 8 character long</li>
					<li class="list-item">At least 1 number</li>
					<li class="list-item">At least 1 lowercase letter</li>
					<li class="list-item">At least 1 uppercase letter</li>
					<li class="list-item">At least 1 special character</li>
				</ul>
			</div>
		`;
	}
};

customElements.define("password-feedback", PasswordFeedback);
