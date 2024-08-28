import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";

class PopUpComponent extends HTMLElement {
	static get observedAttributes() {
		return ['image-42-pop-up', 'image-link-pop-up', 'add-new-contact-pop-up'];
	}

	constructor() {
		super();
		this.initializeComponent();
	}


	initializeComponent() {
		if (this.className === 'image-42-pop-up') {
			this.innerHTML = `
				<div class="pop-up-content">
					
				</div>
			`;
		} else if (this.className === 'image-link-pop-up') {
			this.innerHTML = `
				<div class="pop-up-content">
					<i class="fa-solid fa-xmark"></i>
					<h2>Paste link to an image</h2>
					<input type="url" name="image-link" autofocus>
					<button-component label="Save" class="generic-btn-disabled"></button-component>
				</div>
			`;
		} else if (this.className === 'add-new-contact-pop-up') {
			this.innerHTML = `
				<div class="pop-up-content">
					<i class="fa-solid fa-xmark"></i>
					<h2>Add new contact</h2>
					<div class="add-contact-search-bar">
                		<form action="#" autocomplete="off">
                		    <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                		    <div class="add-friend-search-bar-input-container">
                		        <input type="text" placeholder="Search contacts" id="searchBarInput"/>
                		        <ul id="searchResults" class="search-results">
								</ul>
                		    </div>
                		</form>
             		</div>
				</div>
			`
		}
	}


	connectedCallback() {
		this.className = this.getAttribute('class');
		this.initializeComponent();
		if (this.className.match('image'))
			this.attachProfileEventsListener();
		else {
			this.searchInput = this.querySelector('#searchBarInput');
			this.searchResults = this.querySelector('#searchResults');
			this.attachAddFriendsEventsListener();
		}
	}


	attachProfileEventsListener() {
		const input = this.querySelector('input');
		const buttonComponent = this.querySelector('button-component');

		this.querySelector('i').addEventListener('click', (event) => this.remove());
		document.addEventListener('keydown', (event) => {if (event.key === 'Escape') this.remove()});
		this.querySelector('button-component').addEventListener('click', () => this.throwImageLinkSaved(input));
		input.addEventListener('input', () => this.updateSaveButtonState(input));
	}

	attachAddFriendsEventsListener() {
		this.querySelector('i').addEventListener('click', (event) => this.remove());
		document.addEventListener('keydown', (event) => {if (event.key === 'Escape') this.remove()});
		this.searchInput.addEventListener('input', () => this.handleSearchContacts());
	}

	async handleSearchContacts() {
		if (!this.searchInput.value) {
			this.clearSearchResult();
			return ;
		}
		const usersList = await this.getSearchResult('search_users');
		const contactsList = await this.getSearchResult('search_contacts');
		if (usersList !== null && contactsList !== null) {
			this.querySelector('ul').classList.remove('no-add-contacts');
			const friendsUsername = contactsList.friends.map(user => user.username);
			const sentUsername = contactsList.sent_requests.map(user => user.username);
			const receivedUsername = contactsList.received_requests.map(user => user.username);
			const resultList = usersList.reduce((acc, user) => {
				if (!friendsUsername.includes(user.username) && !sentUsername.includes(user.username) && !receivedUsername.includes(user.username))
					acc.push(user);
				return acc;
			}, []);
			const currentUser = document.querySelector('.account-infos p').textContent;
			const currentUserIndex = resultList.findIndex(user => user.username === currentUser)
			if (currentUserIndex !== -1)
				resultList.splice(currentUserIndex, 1);
			this.displaySearchResult(resultList);
			this.addContactButtonEventListener();
		}
		else {
			this.clearSearchResult();
			this.querySelector('ul').innerHTML = 'No contacts found...';
			this.querySelector('ul').classList.add('no-add-contacts');
		}
	}

	addContactButtonEventListener() {
		const addContactButtons = this.querySelectorAll('.add-friend-pop-up-button');
		addContactButtons.forEach(addButton => {
			addButton.addEventListener('click', async (event) => {
				const username = event.target.closest('li').querySelector('p').textContent;
				if (await this.handleAddContactRequest(username) === true)
					event.target.closest('li').remove();
			});
		});
	}

	async handleAddContactRequest(username) {
		const payload = {
			status: 'add',
			target_username: username,
		};
		try {
			const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
			console.log(data.message);
			if (data.status === 'success') {
				return true;
			}
			return false;
		} catch (error) {
			console.error('catch: ', error);
			return false;
		}
	}

	displaySearchResult(usersList) {
		this.clearSearchResult();
		usersList.forEach(user => {
			const contactPictureUrl = getProfileImage(user);
			const li = document.createElement('li');
			li.innerHTML = `
            	<div class="add-friend-pop-up-picture">
            	    <img src='${contactPictureUrl}' alt='contact picture'></img>
            	</div>
            	<div class="add-friend-pop-up-username">
            	    <p>${user.username}</p>
            	</div>
				<div class="add-friend-pop-up-button">
                	<p>Add</p>
					<img src='../../../assets/add_friend.svg' alt='add_contact'></img>
            	</div>
        	`;
			this.searchResults.appendChild(li);
		});
	}

	clearSearchResult() {
		this.searchResults.innerHTML = '';
	}

	async getSearchResult(requestType, ) {
		let url = null;
		if (requestType === 'search_contacts')
			url = `http://localhost:8003/friends/search_contacts/`;
		else if (requestType === 'search_users')
			url = `http://localhost:8000/user/search_users/?q=${encodeURIComponent(this.searchInput.value)}`;
		try {
			const data = await sendRequest('GET', url, null);
			if (data.status === 'success') {
				return data.message;
			} else {
				return null;
			}
		} catch (error) {
			return null;
		}
	}

	throwImageLinkSaved(input) {
		if (input.value !== '') {
			this.dispatchEvent(new CustomEvent('imageLinkSaved', {
				detail: { url: input.value },
				bubbles: true
				// composed: true
			}));
			this.throwClosePopUpEvent();
		}
	}


	updateSaveButtonState(input) {
		console.log('test')
		const saveButton = this.querySelector('button-component');

		if (input.value !== '') {
			saveButton.className = 'generic-btn';
		} else {
			saveButton.className = 'generic-btn-disabled';
		}
	}


}

customElements.define('pop-up-component', PopUpComponent);