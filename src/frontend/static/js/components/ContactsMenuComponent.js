import './ContactComponent.js';
import { getString } from '../utils/languageManagement.js';
import { sendRequest } from "../utils/sendRequest.js";
import './Friendship/FriendshipButtonComponent.js';
import './PopUpComponent.js'

class FriendsMenuComponent extends HTMLElement {
    constructor() {
        super();
        this.initComponent();
    }

    async initComponent() {
        this.innerHTML = `
            <p id="errorContactsFeedback"></p>
            <div class='bottom-nav-contacts'>
                <img src='../../assets/contact.svg' alt='contact-icon'>
            </div>
            <div class='contact-menu partial-border'>
                <div class='top-bar-contacts-menu'>
                    <div class='add-contact'>
                        <img src='../../assets/add_friend_white.svg' alt='add-friend-icon'>
                    </div>
                    <form action="#" autocomplete="off">
                        <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                        <input type="text" placeholder="${getString('contactMenuComponent/searchContactPlaceHolder')}" id="search-contact-input"/>
                    </form>
                </div>
                <div class='contact-list-menu'>
                    <p class='contact-summary'></p>
                    <ul class="contact-list-result"></ul>
                    <p class='pending-contact-summary'></p>
                    <ul class="pending-contact-list-result"></ul>
                </div>
            </div>
        `;

        this.addContact = this.querySelector('.add-contact');
        this.contactList = this.querySelector('.contact-list-result');
        this.pendingContactList = this.querySelector('.pending-contact-list-result');
        this.contactMenuDiv = this.querySelector('.contact-menu');
        this.contactSummary = this.querySelector('.contact-summary');
        this.pendingContactSummary = this.querySelector('.pending-contact-summary');
        this.searchContactInput = this.querySelector('#search-contact-input');
        this.contactBottomNavDiv = this.querySelector('.bottom-nav-contacts');
        
        this.contactMenuDiv.style.display = 'none';
        this.pendingContactList.style.display = 'none';
        this.contactBottomNavDiv.style.display = 'none';
        this.isMouseDown = false;
    }

    async connectedCallback() {
        await this.displayContactList();
        this.attachEventListener();
    }

    async displayContactList() {        
        const contacts = await this.getDataRequest('search_contacts');
        if (!contacts) {
            this.remove();
            return;
        }
        const contactsData = await this.getDataRequest('users_data', contacts.friends);
        
        this.contactBottomNavDiv.style.display = 'flex';
        this.contactSummary.innerHTML = `<p>${getString('contactMenuComponent/contactsTitle')}</p>`;
        if (!contactsData || contactsData.length === 0) {
            this.contactList.innerHTML = `${getString('contactMenuComponent/noContacts')}`;
            this.contactList.classList.add('no-contacts');
        }
        else {
            this.createContactList(contactsData, 'contacts');
        }
        const receivedRequestUsersData = await this.getDataRequest('users_data', contacts.received_requests);
        const sentRequestUsersData = await this.getDataRequest('users_data', contacts.sent_requests);
        const requestsCount = contacts.received_requests.length + contacts.sent_requests.length;
        this.pendingContactSummary.innerHTML = `<p>${getString('contactMenuComponent/pendingContactsTitle')} - ${requestsCount}</p>`;
        if (requestsCount === 0) {
            this.pendingContactSummary.innerHTML = `<p>${getString('contactMenuComponent/pendingContactsTitle')}</p>`;
            this.pendingContactList.innerHTML = `${getString('contactMenuComponent/noContactsRequest')}`
            this.pendingContactList.classList.add('no-contacts');
        }
        else {
            this.createContactList(sentRequestUsersData, 'sent_requests');
            this.createContactList(receivedRequestUsersData, 'received_requests');
        }
    }

    createContactList(contacts, status) {
        const sortedList = contacts.sort((a, b) => a.username.localeCompare(b.username));
        sortedList.forEach(contact => {
            const li = document.createElement('li');
            li.innerHTML = `
                <contact-component data-user='${JSON.stringify(contact)}' data-status='${status}'></contact-component>
            `;
            if (contact.status === 'online')
                li.classList.add('online-contact-status')
            else if (contact.status === 'offline')
                li.classList.add('offline-contact-status')
            else if (contact.status === 'away')
                li.classList.add('away-contact-status')
            if (status === 'contacts')
                this.contactList.appendChild(li);
            else
                this.pendingContactList.appendChild(li);
        });
    }

    async getDataRequest(requestType, payload) {
        let url = null;
        if (requestType === 'search_contacts')
            url = `/api/friends/search_contacts/`;
        else if (requestType === 'users_data') {
            const encodedList = encodeURIComponent(JSON.stringify(payload));
            url = `/api/user/get_users_info/?q=${encodedList}`
        }
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

    attachEventListener() {
        const chatMainMenu = document.querySelector('.chat-main-menu');

        this.addEventListener('click', (event) => {
            const chatComponent = document.querySelector('.chat-main-menu');

            if (chatComponent && chatComponent.style.display !== 'none' && event.target.className !== "contact-action-send-message")
                this.throwCloseChatComponent();
            event.stopPropagation();
            this.throwCloseContactActionList();
        });

        this.contactBottomNavDiv.addEventListener('click', () => {
            this.contactMenuDiv.style.display = (this.contactMenuDiv.style.display === 'none') ? 'block' : 'none';
        });
        this.pendingContactSummary.addEventListener('click', () => {
            this.pendingContactList.style.display = this.pendingContactList.style.display === 'none' ? 'block' : 'none';
        });
        this.contactSummary.addEventListener('click', () => {
            this.contactList.style.display = this.contactList.style.display === 'none' ? 'block' : 'none';
        });
        this.addContact.addEventListener('click', () => {
            const popUp = document.createElement('pop-up-component');

            popUp.classList.add('add-new-contact-pop-up');
            app.appendChild(popUp);
        })
        this.searchContactInput.addEventListener('input', () => this.updateContactList());

        document.addEventListener('click', (event) => {
            if (this.contactMenuDiv)
                this.contactMenuDiv.style.display = 'none';
        });
    }

    async updateContactList() {        
        const contacts = await this.getDataRequest('search_contacts');
        const contactsData = await this.getDataRequest('users_data', contacts.friends);
        const searchValue = this.searchContactInput.value.toLowerCase();
        let displayedUsername = this.getCurrentDisplayedContactUsername();
		if (!searchValue) {
            const contactsUsername = contacts.friends.map(contact => contact.username);
            if (!contactsUsername.every(username => displayedUsername.includes(username))) {
                this.contactList.innerHTML = '';
                this.contactList.classList.remove('no-contacts');
                this.createContactList(contactsData, 'contacts');
            }
			return ;
		}
        this.deleteObsoleteContact(searchValue);
        const newContactsToDisplay = this.getContactsToDisplay(contacts.friends, searchValue);
        if (newContactsToDisplay.length !== 0) {
            if (this.contactList.innerHTML === `${getString('contactMenuComponent/noContacts')}`) {
                this.contactList.innerHTML = '';
                this.contactList.classList.remove('no-contacts');
            }
            const newContactsToDisplayData = await this.getDataRequest('users_data', newContactsToDisplay);
            this.createContactList(newContactsToDisplayData, 'contacts');
        } else {
            let displayedUsername = this.getCurrentDisplayedContactUsername();
            if (displayedUsername.length === 0) {
                this.contactList.innerHTML = `${getString('contactMenuComponent/noContacts')}`;
                this.contactList.classList.add('no-contacts');
            }
        }
	}

    getCurrentDisplayedContactUsername() {
        const currentContacts = this.contactList.querySelectorAll('contact-component');
        return Array.from(currentContacts).map(contact => contact.userData.username.toLowerCase());
    }

    getContactsToDisplay(contacts, searchValue) {
        const currentContactUsernames = Array.from(this.contactList.querySelectorAll('contact-component'))
            .map(contact => contact.userData.username.toLowerCase());

        const filteredContacts = contacts.filter(contact =>
            contact.username.toLowerCase().includes(searchValue) &&
            !currentContactUsernames.includes(contact.username.toLowerCase())
        );
        return filteredContacts;
    }

    deleteObsoleteContact(searchValue) {
        const currentContactDisplay = this.contactList.querySelectorAll('li:not(.contact-action-list li)');
        currentContactDisplay.forEach(contactComponent => {
            const contact = contactComponent.querySelector('contact-component')
            const username = contact.userData.username.toLowerCase();
            if (!username.includes(searchValue))
                contactComponent.remove();
        })
    }

    throwCloseContactActionList() {
        const event = new CustomEvent('closeContactActionList', {
            bubbles: true,
        });
        document.dispatchEvent(event);
    }

    throwCloseChatComponent() {
        const event = new CustomEvent('closeChatComponent', {
            bubbles: true,
        });
        document.dispatchEvent(event);
    }
}

customElements.define("contact-menu-component", FriendsMenuComponent);
