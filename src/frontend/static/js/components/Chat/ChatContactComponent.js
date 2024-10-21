import getProfileImage from "../../utils/getProfileImage.js";
import { sendRequest } from "../../utils/sendRequest.js";

class ChatContactComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-chatroom"];
    };

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'data-user') {
			this.userData = JSON.parse(newValue);
			this.render();
		}
		if (name === 'data-chatroom') {
			this.chatroom = newValue;
		}
	}

	constructor() {
		super();
		this.userData = null;
	};

	async render() {
		let profileImage = await getProfileImage(this.userData);
		const lastMessage = await this.getChatroomLastMessage();

		console.log('in ChatContactComponent: ', lastMessage);
		this.innerHTML = `
		<div class="chat-contact-profile-picture">
			<img src=${profileImage} alt='contact picture'></img>
			<div class="chat-status-circle online"></div>
		</div>
		<div class="chat-contact-info">
			<p>${this.userData.username}</p>
			<p>${this.formatLastMessage(lastMessage)}</p>
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

	async getChatroomLastMessage() {
		let res = await sendRequest('GET', `/api/chat/get_chatroom_last_message/?chatroomId=${this.chatroom}`, null, false);

		if (res.status === 'Error') return 'Problem getting last message of chatroom';

		console.log(res);
		return res.lastMessage[0].fields.body;
	}

	formatLastMessage(lastMessage) {
		return lastMessage.length > 87 ? lastMessage.slice(0, 86) + '......' : lastMessage;
	}
}

customElements.define('chat-contact-component', ChatContactComponent);
