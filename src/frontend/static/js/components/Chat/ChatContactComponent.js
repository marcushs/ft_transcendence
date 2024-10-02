class ChatContactComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-status"];
    };

	constructor() {
		super();
		this.render();
	};

	render() {
		this.innerHTML = `
		<div class="contact-profile-picture">
			<img src='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg' alt='contact picture'></img>
		</div>
		<div class="status-circle">
		</div>
		<div class="contact-info">
			<p>Test</p>
			<p>Online</p>
		</div>
		<i class="fa-solid fa-angle-up"></i>
		`;
	};

}

customElements.define('chat-contact-component', ChatContactComponent);
