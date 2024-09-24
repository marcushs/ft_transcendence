class ContactMenuSearchBar extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.boundHandleClick = this.handleClick.bind(this);
		this.attachEventListener();
	};

	render() {
		this.innerHTML = `
			<div class="contact-menu-search-bar">
				<p class="contact-text">CONTACTS</p>
				<div class='search-box'>
					<input type="text" placeholder="Search contacts" id="search-contact-input"/>
				</div>
				<i id="search-bar-close-btn" class="fa-solid fa-xmark" aria-hidden="true"></i>
				<img id="search-bar-icon" src="../../assets/search-bar-icon.svg" alt="search-bar-icon">
				<img id="add-friend-icon" src="../../assets/add_friend_white.svg" alt="add-friend-icon">
			</div>
		`;

		this.contactText = document.querySelector('.contact-text');
		this.searchBox = document.querySelector('.search-box');
		this.searchContactInput = document.getElementById('search-contact-input');
		this.searchBarIcon = document.getElementById('search-bar-icon');
		this.addFriendIcon = document.getElementById('add-friend-icon');
		this.searchBarCloseBtn = document.getElementById('search-bar-close-btn');
	}

	attachEventListener() {
		this.contactText.addEventListener('click', this.boundHandleClick);
		this.searchBox.addEventListener('click', this.boundHandleClick);
		this.searchBarIcon.addEventListener('mouseenter', () => {
			this.searchBox.classList.add("hover");
		});
		this.searchBarIcon.addEventListener('mouseleave', () => {
			this.searchBox.classList.remove("hover");
		});
		this.searchBarIcon.addEventListener('click', this.boundHandleClick);
		this.searchBarCloseBtn.addEventListener('click', this.boundHandleClick);
	};

	handleClick(e) {
		if (e.target.id === 'search-bar-icon' && this.searchBarIcon.classList.contains("active")) return;
		if (e.target.classList.contains("active") && e.target.classList.contains("search-box")) return;
		if (e.target.id === 'search-contact-input') return ;
		this.contactText.classList.toggle('inactive');
		this.searchBox.classList.toggle('active');
		this.searchContactInput.classList.toggle('active');
		this.searchBarIcon.classList.toggle('active');
		this.searchBarCloseBtn.classList.toggle('active');
		this.searchContactInput.focus();
	}
};

customElements.define("contact-menu-search-bar", ContactMenuSearchBar);
