class ChatMessageComponent extends HTMLElement {
	constructor(messageData) {
		super();
		this.messageData = messageData;
		this.render();
	}

	render() {
		this.innerHTML = `
		<div class="chat-message-container">
			<p class="chat-message-bubble">${messageData.message}</p>
			<div class="chat-message-info">
				<p class="chat-message-time">${messageData.timestamp}</p>
				<div class="chat-message-read unread">
					<i class="fa-solid fa-check"></i>
					<i class="fa-solid fa-check"></i>
				</div>
			</div>
		</div>
		`;
	}
}

customElements.define('chat-message-component', ChatMessageComponent);
