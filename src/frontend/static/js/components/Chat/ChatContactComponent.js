import getProfileImage from "../../utils/getProfileImage.js";
import { sendRequest } from "../../utils/sendRequest.js";

export default class ChatContactComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-chatroom"];
    };

	// attributeChangedCallback(name, oldValue, newValue) {
	// 	if (name === 'data-user') {
	// 		this.userData = JSON.parse(newValue);
	// 		this.render();
	// 	}
	// 	if (name === 'data-chatroom') {
	// 		this.chatroom = newValue;
	// 	}
	// }

	constructor(userData, chatroomId) {
		super();
		this.userData = userData;
		this.chatroom = chatroomId;
		this.render();
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
			<p>${this.formatLastMessage(lastMessage.body)}</p>
		</div>
		<div class="message-status">
			<div class="last-message-datetime">
				<span>${this.formatCreatedDatetime(lastMessage.created)}</span>
			</div>
			<div class="unread-circle"></div>
		</div>
		`;
	};

	async getChatroomLastMessage() {
		let res = await sendRequest('GET', `/api/chat/get_chatroom_last_message/?chatroomId=${this.chatroom}`, null, false);

		if (res.status === 'Error') return 'Problem getting last message of chatroom';

		console.log(res);
		return res.lastMessage[0].fields;
	}

	formatLastMessage(lastMessage) {
		return lastMessage.length > 87 ? lastMessage.slice(0, 86) + '......' : lastMessage;
	}

	formatCreatedDatetime(created) {
		const date = new Date(created);
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
	  
		if (this.isSameDay(date, now)) {
		  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
		} else if (this.isSameDay(date, yesterday)) {
		  return 'Yesterday';
		} else {
		  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
		}
	  }
	  
	isSameDay(date1, date2) {
		return date1.getFullYear() === date2.getFullYear() &&
			   date1.getMonth() === date2.getMonth() &&
			   date1.getDate() === date2.getDate();
	  }
}

customElements.define('chat-contact-component', ChatContactComponent);
