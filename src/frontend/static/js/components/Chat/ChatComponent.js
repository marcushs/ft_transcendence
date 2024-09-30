import "./ChatSearchBar.js"

class ChatComponent extends HTMLElement {
	constructor() {
		super();
		this.render();
		// this.getElements();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<img class='chat-icon' src='../../assets/chat-icon.svg' alt='chat-icon'>
			<div class="chat-main-menu">
				<i id="chat-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
                <div id="chat-search-bar-div"></div>
			</div>
		`;

		this.chatIcon = this.querySelector('.chat-icon');
		this.chatMainMenu = this.querySelector('.chat-main-menu');
		this.chatSearchBarDiv = this.querySelector('#chat-search-bar-div');
		this.chatCloseBtn = this.querySelector('#chat-close-btn');

		this.chatMainMenu.style.display = 'none';
		console.log(this.chatMainMenu.style.display);
	}

	// getElements() {
	// 	this.chatIcon = this.querySelector('.chat-icon');
	// 	this.chatMainMenu = this.querySelector('.chat-main-menu');
	// 	this.chatSearchBarDiv = this.querySelector('#chat-search-bar-div');
	// 	this.chatCloseBtn = this.querySelector('#chat-close-btn');

	// 	this.chatMainMenu.style.display = 'none';
	// }

	addEventListeners() {
		this.chatIcon.addEventListener('click', () => this.chatMainMenu.style.display = this.chatMainMenu.style.display === 'none' ? 'block' : 'none');
		this.chatCloseBtn.addEventListener('click', () => this.chatMainMenu.style.display = 'none');
		if (this.chatMainMenu.style.display = 'block') this.chatSearchBarDiv.innerHTML = '<chat-search-bar></chat-search-bar>';
	}
}

customElements.define("chat-component", ChatComponent);
