import "./ChatSearchBar.js";
import "./ChatContactList.js";
import "./ChatRoomTopBar.js";
import "./ChatRoomBottomBar.js";
import "./ChatRoomConversation.js";
import checkAuthentication from "../../utils/checkAuthentication.js"
import { updateChatContactListDOM } from "../../utils/chatUtils/joinRoomUtils.js";

class ChatComponent extends HTMLElement {
	constructor() {
		super();
		this.init();
	}
	
	async init() {
		if (await checkAuthentication()) {
			this.render()
			this.addEventListeners();
		}
	}

	render() {
		this.innerHTML = `
			<img class='chat-icon' src='../../assets/chat-icon.svg' alt='chat-icon'>
			<div class="chat-unread-message-notif">
				<div class="ping"></div>
			</div>
			<div class="chat-main-menu ">
				<i id="chat-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
				<div class="chat-lobby ">
					<div id="chat-search-bar-div"></div>
					<div class="chat-contact-container">
						<chat-contact-list></chat-contact-list>
					</div>
				</div>
				<div class="chatroom"></div>
			</div>
		`;

		this.chatIcon = this.querySelector('.chat-icon');
		this.chatMainMenu = this.querySelector('.chat-main-menu');
		this.chatSearchBarDiv = this.querySelector('#chat-search-bar-div');
		this.chatCloseBtn = this.querySelector('#chat-close-btn');
		this.contactContainer = this.querySelector('.chat-contact-container');
		this.chatRoomTopBarDiv = this.querySelector('#chatroom-top-bar-div');
		this.chatLobby = this.querySelector('.chat-lobby');

		this.chatMainMenu.style.display = 'none';
		this.chatRoom = this.querySelector('.chatroom');
	}

	addEventListeners() {
		this.chatIcon.addEventListener('click', () => {
			this.chatMainMenu.style.display = this.chatMainMenu.style.display === 'none' ? 'block' : 'none';
			if (this.chatMainMenu.style.display === 'none') this.removeChatroomDOM();
			if (this.chatRoom.classList.contains('active')) this.chatRoom.classList.remove('active');
			this.chatLobby.classList.add('active');
			this.chatSearchBarDiv.innerHTML = this.chatMainMenu.style.display === 'block' ? "<chat-search-bar></chat-search-bar>" : '';
			// if (this.chatMainMenu.style.display === 'block') updateChatContactListDOM();
		});
		this.chatCloseBtn.addEventListener('click', () => {
			this.chatMainMenu.style.display = 'none';
			this.removeChatroomDOM();
		});
	}

	removeChatroomDOM() {
		if (document.querySelector('chatroom-top-bar')) document.querySelector('chatroom-top-bar').remove();
		if (document.querySelector('chatroom-conversation')) document.querySelector('chatroom-conversation').remove();
		if (document.querySelector('chatroom-bottom-bar')) document.querySelector('chatroom-bottom-bar').remove();
	}
}

customElements.define("chat-component", ChatComponent);
