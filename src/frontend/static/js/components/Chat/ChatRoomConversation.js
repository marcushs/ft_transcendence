import { sendRequest } from "../../utils/sendRequest.js";
import ChatMessageComponent from "./ChatMessageComponent.js";
import { isSentOrReceivedMessage } from "../../utils/chatUtils/sendPrivateMessage.js";

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

	connectedCallback() {
		console.log('Component connected to DOM');
	}

	render() {
		this.innerHTML = `
		<div class="chatroom-conversation-message-container">
			<ul></ul>
		</div>
		`;
	};
	
	async findMatchingChatroom(userId) {
		let res = await sendRequest('GET', `/api/chat/find_matching_chatroom/?targetUserId=${userId}`, null, false);
		
		if (!res.chatroom_id) return;
		
		this.chatroom = res.chatroom_id
		console.log('chatroom conversation chatroom id: ', this.chatroom)
		this.setAttribute('data-chatroom', this.chatroom);
	}

	async displayLast20Messages() {
		if (!this.chatroom || this.chatroom === '') return ;

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
			this.scrollTop = this.scrollHeight;
		}
		// last20Messages.forEach(async (message) => {
		// 	const messageData = message.fields;
		// 	const chatroomConversationUl = this.querySelector('.chatroom-conversation-message-container > ul');
		// 	const liElem = document.createElement('li');
		// 	const messageComponent = new ChatMessageComponent(messageData);

		// 	const isSent = await isSentOrReceivedMessage(messageData.author);
		// 	messageComponent.classList.add(isSent);
		// 	liElem.appendChild(messageComponent);
		// 	chatroomConversationUl.appendChild(liElem);
		// });
	}
};

customElements.define('chatroom-conversation', ChatRoomConversation);
