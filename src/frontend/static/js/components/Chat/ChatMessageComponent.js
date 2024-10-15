class ChatMessageComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-message"];
    }

	constructor() {
		super();
		this.render();
	}

	render() {
		this.innerHTML = `
		<div class="chat-message-container">
			<div class="chat-message-bubble">
				<p>Message</p>
			</div>
			<div class="chat-message-info">
				<p>18:22</p>
			</div>
		</div>
		`;
	}
}

customElements.define('chat-message-component', ChatMessageComponent);
