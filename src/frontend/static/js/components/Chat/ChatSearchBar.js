class ChatSearchBar extends HTMLElement {
	constructor() {
		super();
		this.render();
		this.boundHandleClick = this.handleClick.bind(this);
		this.boundHandleInput = this.handleInput.bind(this);
		this.attachEventListener();
		this.searchContactsRemoved = [];
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
			</div>
		`;

		this.contactText = document.querySelector('.contact-text');
		this.chatSearchBox = document.querySelector('.chat-search-box');
		this.searchContactInput = document.getElementById('chat-search-contact-input');
		this.searchBarIcon = document.getElementById('search-bar-icon');
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
		this.searchContactInput.addEventListener('input', this.boundHandleInput)
	};

	handleClick(e) {
		e.stopPropagation();
		if (e.target.id === 'search-bar-icon' && this.searchBarIcon.classList.contains("active")) return;
		if (e.target.classList.contains("active") && e.target.classList.contains("chat-search-box")) return;
		if (e.target.id === 'chat-search-contact-input') return ;
		const searchBarIcon = this.querySelector('#search-bar-icon');

		this.searchContactInput.value = '';
		document.querySelector('#contactedList > .contacted-list').className = "contacted-list";
		document.querySelector('#contactList > .contacted-list').className = "contacted-list";
		this.setContactDisplayFlex();
		(searchBarIcon.style.display === 'none') ? searchBarIcon.style.display = 'flex' : searchBarIcon.style.display = 'none';
		this.contactText.classList.toggle('inactive');
		this.chatSearchBox.classList.toggle('active');
		this.searchContactInput.classList.toggle('active');
		this.searchBarIcon.classList.toggle('active');
		this.searchBarCloseBtn.classList.toggle('active');
		this.searchContactInput.focus();
		if (e.target.id === 'search-bar-close-btn') this.searchContactInput.value = '';
	}

	handleInput(e) {
		let searchInput = this.searchContactInput.value;
		const contacts = document.querySelectorAll('chat-contact-component');
		const contactedList = document.querySelector('#contactedList > .contacted-list');
		const contactList = document.querySelector('#contactList > .contacted-list');

		if (this.searchContactInput.value === '') {
			this.searchContactInput.value = '';
			contactedList.className = "contacted-list";
			contactList.className = "contacted-list";
			this.setContactDisplayFlex();
			return;
		}

		if (!contactedList.classList.contains('active'))
			contactedList.classList.add('active');

		if (!contactList.classList.contains('active'))
			contactList.classList.add('active');


		contacts.forEach(contact => {
			const userData = JSON.parse(contact.getAttribute('data-user'));

			console.log(userData, searchInput);
			if (!userData.username.includes(searchInput)) {
				contact.parentElement.style.display = "none";
			} else {
				contact.parentElement.style.display = "flex";
			}
		});
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

};

customElements.define('chat-search-bar', ChatSearchBar);
