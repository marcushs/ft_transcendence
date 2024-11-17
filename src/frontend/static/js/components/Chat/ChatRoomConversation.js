import { sendRequest } from "../../utils/sendRequest.js";
import ChatMessageComponent from "./ChatMessageComponent.js";
import { isSentOrReceivedMessage } from "../../utils/chatUtils/sendPrivateMessage.js";
import {getString} from "../../utils/languageManagement.js";

export default class ChatRoomConversation extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-chatroom"];
    }

	constructor() {
		super();
		this.chatroom = null;
		this.render();
	};

    attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		switch (name) {
            case 'data-user':
                const userData = JSON.parse(newValue);
				if (userData.username === getString("chatComponent/tournamentBot")) break;
                this.findMatchingChatroom(userData.id);
                break;
            case 'data-chatroom':
                this.chatroom = newValue;
                if (this.chatroom && this.chatroom !== '') {
                    this.displayLast20Messages();
                }
                break;
        }
	}

	render() {
		this.innerHTML = `
		<div class="chatroom-conversation-message-container">
			<ul></ul>
		</div>
		`;
	};
	
	async findMatchingChatroom(userId) {
		try {
			let res = await sendRequest('GET', `/api/chat/find_matching_chatroom/?targetUserId=${userId}`, null, false);
			
			this.chatroom = res.chatroom_id
			this.setAttribute('data-chatroom', this.chatroom);
		} catch (error) {
			console.log('Error when finding matching chatroom: ', error.message)
		}
	}

	async displayLast20Messages() {
		if (!this.chatroom || this.chatroom === '') return ;

		try {
			const res = await sendRequest('GET', `/api/chat/get_last_20_messages/?chatroomId=${this.chatroom}`, null, false);
	
			console.log('in displayLast20Messages', res);
	
			const last20Messages = res.last20Messages;
	
			for (let i = last20Messages.length - 1; i >= 0; --i) {
				const messageData = last20Messages[i].fields;
				const chatroomConversationUl = this.querySelector('.chatroom-conversation-message-container > ul');
				const liElem = document.createElement('li');
				const messageComponent = new ChatMessageComponent(messageData);
	
				const isSent = await isSentOrReceivedMessage(messageData.author);
				messageComponent.classList.add(isSent);
				liElem.appendChild(messageComponent);
				chatroomConversationUl.appendChild(liElem);
			}
			this.scrollTop = this.scrollHeight;
		} catch (error) {
			console.log("Error getting last 20 messages: ", error.message);
		}
	}
};

customElements.define('chatroom-conversation', ChatRoomConversation);
