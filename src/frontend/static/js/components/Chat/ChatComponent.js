import "./ChatSearchBar.js";
import "./ChatContactList.js";
import "./ChatRoomTopBar.js";
import "./ChatRoomBottomBar.js";
import "./ChatRoomConversation.js";

class ChatComponent extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<img class='chat-icon' src='../../assets/chat-icon.svg' alt='chat-icon'>
			<div class="chat-main-menu ">
				<i id="chat-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
				<div class="chat-lobby ">
					<div id="chat-search-bar-div"></div>
					<div class="chat-contact-container">
						<chat-contact-list title="online"></chat-contact-list>
						<chat-contact-list title="offline"></chat-contact-list>
					</div>
				</div>
				<div class="chatroom active">
					<chatroom-conversation></chatroom-conversation>
					<chatroom-bottom-bar></chatroom-bottom-bar>
				</div>
			</div>
		`;

		this.chatIcon = this.querySelector('.chat-icon');
		this.chatMainMenu = this.querySelector('.chat-main-menu');
		this.chatSearchBarDiv = this.querySelector('#chat-search-bar-div');
		this.chatCloseBtn = this.querySelector('#chat-close-btn');
		this.contactContainer = this.querySelector('.chat-contact-container');
		this.chatRoomTopBarDiv = this.querySelector('#chatroom-top-bar-div');

		this.chatMainMenu.style.display = 'none';
		this.chatRoom = this.querySelector('.chatroom');
	}

	addEventListeners() {
		this.chatIcon.addEventListener('click', () => {
			this.chatMainMenu.style.display = this.chatMainMenu.style.display === 'none' ? 'block' : 'none';
			this.chatSearchBarDiv.innerHTML = this.chatMainMenu.style.display === 'block' ? "<chat-search-bar></chat-search-bar>" : '';
		});
		this.chatCloseBtn.addEventListener('click', () => this.chatMainMenu.style.display = 'none');
	}
}

customElements.define("chat-component", ChatComponent);
