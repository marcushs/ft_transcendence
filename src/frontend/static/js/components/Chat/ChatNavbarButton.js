class ChatNavbarButton extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = 
		`
			<div class="chat-icon-container">
				<i class="fa-regular fa-comments"></i>
			</div
		`;
	}

}
customElements.define("chat-navbar-button", ChatNavbarButton);
