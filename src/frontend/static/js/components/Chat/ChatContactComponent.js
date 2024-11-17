import getProfileImage from "../../utils/getProfileImage.js";
import { sendRequest } from "../../utils/sendRequest.js";
import { displayChatroomComponent } from "../../utils/chatUtils/sendMessageCallback.js";
import { checkAllRecentMessagesRead, unreadMessageNotifOff } from "../../utils/chatUtils/sendPrivateMessage.js";

export default class ChatContactComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-chatroom"];
    };

	constructor(userData, chatroomId) {
		super();
		this.userData = userData;
		this.chatroom = chatroomId;
		this._renderComplete = false;
	};
	
	connectedCallback() {
		this.render();
		this.addEventListeners();
	}

	async render() {
		let profileImage = await getProfileImage(this.userData);
		const lastMessage = await this.getChatroomLastMessage();

		this.innerHTML = `
		<div class="chat-contact-profile-picture">
			<img src=${profileImage} alt='contact picture'></img>
			<div class="chat-status-circle ${await this.getUserStatus()}"></div> 
		</div>
		<div class="chat-contact-info">
			<p class="chat-contact-username">${this.userData.username}</p>
			<p class="last-message">${this.formatLastMessage(lastMessage.body)}</p>
		</div>
		<div class="message-status">
			<div class="last-message-datetime">
				<span>${this.formatCreatedDatetime(lastMessage.created)}</span>
			</div>
			<div class="unread-circle"></div>
		</div>
		`;
		this._renderComplete = true;
		this.dispatchEvent(new CustomEvent('renderComplete'));
	};

	async getChatroomLastMessage() {
		try {
			let res = await sendRequest('GET', `/api/chat/get_chatroom_last_message/?chatroomId=${this.chatroom}`, null, false);
	
			return res.lastMessage[0].fields;
		} catch (error) {
			console.log('Error trying to fetch chatroom last message: ', error.message);
			return 'Problem getting last message of chatroom';
		}
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

	updateLastMessage(message) {
		message = this.formatLastMessage(message);

		this.querySelector('.last-message').innerText = message;
	}

	whenRendered() {
		return new Promise((resolve) => {
		  if (this._renderComplete) {
			resolve();
		  } else {
			this.addEventListener('renderComplete', () => resolve(), { once: true });
		  }
		});
	}

	addEventListeners() {
		this.addEventListener('click', () => {
			const unreadCircle = this.querySelector('.unread-circle');
			displayChatroomComponent(this.userData, true);

			if (unreadCircle.classList.contains('active')) unreadCircle.classList.remove('active');

			if (checkAllRecentMessagesRead()) unreadMessageNotifOff();

		})
	}

	async getUserStatus() {
		try {
			let res = await sendRequest('GET', `/api/user/get_user_status/?userId=${this.userData.id}`, null, false);
			
			return res.user_status;
		} catch (error) {
			console.log('Error trying to get user status: ', error.message);
			return null;
		}
	}
}

customElements.define('chat-contact-component', ChatContactComponent);
