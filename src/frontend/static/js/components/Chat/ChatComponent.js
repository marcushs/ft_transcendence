import "./ChatSearchBar.js";
import "./ChatContactList.js";

class ChatComponent extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<img class='chat-icon' src='../../assets/chat-icon.svg' alt='chat-icon'>
			<div class="chat-main-menu">
				<i id="chat-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
                <div id="chat-search-bar-div"></div>
				<div class="contact-container">
					<chat-contact-list title="online"></chat-contact-list>
					<chat-contact-list title="offline"></chat-contact-list>
				</div>
			</div>
		`;

		this.chatIcon = this.querySelector('.chat-icon');
		this.chatMainMenu = this.querySelector('.chat-main-menu');
		this.chatSearchBarDiv = this.querySelector('#chat-search-bar-div');
		this.chatCloseBtn = this.querySelector('#chat-close-btn');
		this.contactContainer = this.querySelector('.contact-container');

		this.chatMainMenu.style.display = 'none';
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
