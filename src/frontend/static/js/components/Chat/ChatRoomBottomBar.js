export default class ChatRoomBottomBar extends HTMLElement {
	constructor() {
		super();
		this.render();
	};

	render() {
		this.innerHTML = `
			<div class="chatroom-message-box">
				<p id="chatErrorFeedback">hi</p>
				<input class="chatroom-message-input" type="text" maxlength="300">
			</div>
			<button class="send-message-btn" type="submit"><i class="fa-regular fa-paper-plane"></i></button>
		`;
	};
};

customElements.define('chatroom-bottom-bar', ChatRoomBottomBar);
