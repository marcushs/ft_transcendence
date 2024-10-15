import { sendRequest } from "../../utils/sendRequest.js";
import "./ChatMessageComponent.js";

class ChatRoomConversation extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-chatroom"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-user') {
			const userData = JSON.parse(newValue);

			this.findMatchingChatroom(userData.id);
		}
		if (name === 'data-chatroom') {
			this.chatroom = newValue;
		}
	}

	constructor() {
		super();
		this.chatroom = null;
		this.render();
	};

	render() {
		this.innerHTML = `
		<div class="chatroom-conversation-message-container">
			<ul>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
				<li><chat-message-component></chat-message-component></li>
			</ul>
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
};



customElements.define('chatroom-conversation', ChatRoomConversation);
