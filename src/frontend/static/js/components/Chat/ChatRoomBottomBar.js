import { sendRequest } from "../../utils/sendRequest.js";

class ChatRoomBottomBar extends HTMLElement {
	constructor() {
		super();
		this.render();
		// this.attachEventListeners();
	};

	render() {
		this.innerHTML = `
			<div class="chatroom-message-box">
				<input class="chatroom-message-input" type="text">
			</div>
			<button class="send-message-btn" type="submit">submit</button>
		`;
	};

	// async attachEventListeners() {
	// 	const sendMessageBtn = this.querySelector('.send-message-btn');
	// 	const chatRoomMessageInput = this.querySelector('chatroom-message-input');

	// 	sendMessageBtn.addEventListener('click', this.sendMessage)
	// }

	// async sendMessage() {
	// 	const chatRoomMessageInput = document.querySelector('.chatroom-message-input');
	// 	const chatRoomTopBar = document.querySelector('chatroom-top-bar');
	// 	let targetUserData = JSON.parse(chatRoomTopBar.getAttribute('data-user'));
	// 	const message = chatRoomMessageInput.value;

	// 	targetUserData.message = message;
	// 	try {
	// 		let res = await sendRequest('POST', '/api/chat/chat_view/', targetUserData, false);
	// 		console.log(res);
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// }
};

customElements.define('chatroom-bottom-bar', ChatRoomBottomBar);
