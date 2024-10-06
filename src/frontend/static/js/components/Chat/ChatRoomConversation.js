class ChatRoomConversation extends HTMLElement {
	constructor() {
		super();
		this.render();
	};

	render() {
		this.innerHTML = `
			<div class="chatroom-conversation"></div>
		`;
	};
};

customElements.define('chatroom-conversation', ChatRoomConversation);
