class ChatSearchBar extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.boundHandleClick = this.handleClick.bind(this);
		this.attachEventListener();
	};

	render() {
		this.innerHTML = `
			<div class="chat-search-bar">
				<p class="contact-text">CONTACTS</p>
				<div class='chat-search-box'>
					<input type="text" placeholder="Search contacts" id="chat-search-contact-input" maxlength="12"/>
				</div>
				<i id="search-bar-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
				<img id="search-bar-icon" src="../../assets/search-bar-icon.svg" alt="search-bar-icon">
				<img id="add-friend-icon" src="../../assets/add_friend_white.svg" alt="add-friend-icon">
			</div>
		`;

		this.contactText = document.querySelector('.contact-text');
		this.chatSearchBox = document.querySelector('.chat-search-box');
		this.searchContactInput = document.getElementById('chat-search-contact-input');
		this.searchBarIcon = document.getElementById('search-bar-icon');
		this.addFriendIcon = document.getElementById('add-friend-icon');
		this.searchBarCloseBtn = document.getElementById('search-bar-close-btn');
	}

	attachEventListener() {
		this.contactText.addEventListener('click', this.boundHandleClick);
		this.chatSearchBox.addEventListener('click', this.boundHandleClick);
		this.searchBarIcon.addEventListener('mouseenter', () => {
			this.chatSearchBox.classList.add("hover");
		});
		this.searchBarIcon.addEventListener('mouseleave', () => {
			this.chatSearchBox.classList.remove("hover");
		});
		this.searchBarIcon.addEventListener('click', this.boundHandleClick);
		this.searchBarCloseBtn.addEventListener('click', this.boundHandleClick);
		this.addFriendIcon.addEventListener('click', () => {
			const popUp = document.createElement('pop-up-component');

			popUp.classList.add('add-new-contact-pop-up');
			document.querySelector('.home-page').appendChild(popUp);
        });
	};

	handleClick(e) {
		if (e.target.id === 'search-bar-icon' && this.searchBarIcon.classList.contains("active")) return;
		if (e.target.classList.contains("active") && e.target.classList.contains("chat-search-box")) return;
		if (e.target.id === 'chat-search-contact-input') return ;
		this.contactText.classList.toggle('inactive');
		this.chatSearchBox.classList.toggle('active');
		this.searchContactInput.classList.toggle('active');
		this.searchBarIcon.classList.toggle('active');
		this.searchBarCloseBtn.classList.toggle('active');
		this.searchContactInput.focus();
		if (e.target.id === 'search-bar-close-btn') this.searchContactInput.value = '';
	}
};

customElements.define('chat-search-bar', ChatSearchBar);
