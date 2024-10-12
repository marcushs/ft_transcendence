import { sendRequest } from "../../utils/sendRequest.js";

class ChatRoomBottomBar extends HTMLElement {
	constructor() {
		super();
		this.render();
	};

	render() {
		this.innerHTML = `
			<div class="chatroom-message-box">
				<input class="chatroom-message-input" type="text">
			</div>
			<button class="send-message-btn" type="submit">submit</button>
		`;
	};
};

customElements.define('chatroom-bottom-bar', ChatRoomBottomBar);
