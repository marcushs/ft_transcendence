import "./ChatSearchBar.js";
import "./ChatContactList.js";
import "./ChatRoomTopBar.js";
import "./ChatRoomBottomBar.js";
import "./ChatRoomConversation.js";
import checkAuthentication from "../../utils/checkAuthentication.js"

class ChatComponent extends HTMLElement {
	constructor() {
		super();
		this.init();
	}
	
	async init() {
		if (await checkAuthentication()) {
			this.render()
			this.attachEventListeners();
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
						<chat-contact-list id="contactedList" type="contacted"></chat-contact-list>
						<chat-contact-list id="contactList" type="contact"></chat-contact-list>
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

	attachEventListeners() {
		const contactMenu = document.querySelector('.contact-menu');

		this.addEventListener('click', (event) => {
			const searchBarIcon = this.querySelector('#search-bar-icon');
			const searchContactInput = document.getElementById('chat-search-contact-input');

			if (event.target.id !== "chat-search-contact-input" && searchBarIcon && searchBarIcon.style.display === 'none') {
				searchBarIcon.style.display = 'flex';
				document.querySelector('.contact-text').classList.toggle('inactive');
				document.querySelector('.chat-search-box').classList.toggle('active');
				searchContactInput.classList.toggle('active');
				searchBarIcon.classList.toggle('active');
				document.getElementById('search-bar-close-btn').classList.toggle('active');
				searchContactInput.value = '';
				document.querySelector('#contactedList > .contacted-list').className = "contacted-list";
				document.querySelector('#contactList > .contacted-list').className = "contacted-list";
				this.setContactDisplayFlex();
			}
			event.stopPropagation();
		});

		document.addEventListener('click', () => {
			const event = new Event('input', {
				bubbles: true,
				cancelable: true
			});

			const chatSearchContactInput = document.querySelector('#chat-search-contact-input');

			if (chatSearchContactInput) {
				chatSearchContactInput.value = '';
				chatSearchContactInput.dispatchEvent(event);
				this.chatMainMenu.style.display = 'none';
			}
		});

		this.chatIcon.addEventListener('click', () => {
			if (contactMenu.style.display !== 'none')
				contactMenu.style.display = 'none';

			this.chatMainMenu.style.display = this.chatMainMenu.style.display === 'none' ? 'block' : 'none';
			if (this.chatMainMenu.style.display === 'none') this.removeChatroomDOM();
			if (this.chatRoom.classList.contains('active')) this.chatRoom.classList.remove('active');
			this.chatLobby.classList.add('active');
			this.chatSearchBarDiv.innerHTML = this.chatMainMenu.style.display === 'block' ? "<chat-search-bar></chat-search-bar>" : '';
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

	setContactDisplayFlex() {
		const contactedList = document.querySelectorAll('#contactedList > ul > li');
		const contactList = document.querySelectorAll('#contactList > ul > li');

		contactedList.forEach(contact => {
			contact.style.display = "flex";
		});

		contactList.forEach(contact => {
			contact.style.display = "flex";
		});
	}
}

customElements.define("chat-component", ChatComponent);
