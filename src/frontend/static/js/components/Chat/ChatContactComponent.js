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
		<div class="chat-contact-profile-picture">
			<img src='https://cdn.intra.42.fr/users/8df16944f4ad575aa6c4ef62f5171bca/acarlott.jpg' alt='contact picture'></img>
			<div class="chat-status-circle online"></div>
		</div>
		<div class="chat-contact-info">
			<p>helloworld!!</p>
			<p>This is an example message This is an example message This is an example message </p>
		</div>
		<div class="message-status">
			<div class="last-message-datetime">
				<span>18:39</span>
			</div>
			<div class="unread-message-count-circle"></div>
			<i class="fa-solid fa-check"></i>
			<div class="double-check">
				<i class="fa-solid fa-check"></i>
				<i class="fa-solid fa-check"></i>
			</div>
		</div>
		`;
	};

}

customElements.define('chat-contact-component', ChatContactComponent);
