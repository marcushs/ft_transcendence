import './ContactComponent.js';
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
            <div class='bottom-nav-contacts'>
                <p>Contacts</p>
                <img src='../../assets/contact.svg' alt='contact-icon'></img>
            </div>
            <div class='contact-menu'>
                <div class='top-bar-contacts-menu'>
                    <div class='add-contact'>
                        <img src='../../assets/add_friend_white.svg' alt='add-friend-icon'></img>
                    </div>
                    <form action="#" autocomplete="off">
                        <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                        <input type="text" placeholder="Search contacts" id="search-contact-input"/>
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
        this.contactBottomNavDiv.style.display = 'flex';
        this.contactSummary.innerHTML = `<p>Contacts-${contacts.friends_count}/${contacts.friends_count} online</p>`;
        if (contacts.friends_count === 0) {
            this.contactList.innerHTML = `No contacts found...`;
            this.contactList.classList.add('no-contacts');
        }
        else
            this.createContactList(contacts.friends, 'friends');
        this.pendingContactSummary.innerHTML = `<p>Contacts Requests-${contacts.requests_count}</p>`;
        if (contacts.requests_count === 0) {
            this.pendingContactSummary.innerHTML = `<p>Contacts Requests</p>`;
            this.pendingContactList.innerHTML = `No contacts request...`
            this.pendingContactList.classList.add('no-contacts');
        }
        else {
            this.createContactList(contacts.sent_requests, 'sent_requests');
            this.createContactList(contacts.received_requests, 'received_requests');
        }
    }

    createContactList(contacts, status) {
        contacts.forEach(async user => {
            const contactData = await this.getDataRequest('user_data', user.username);
            const li = document.createElement('li');
            li.innerHTML = `
                <contact-component data-user='${JSON.stringify(contactData)}' data-status='${status}'></contact-component>
            `;
            if (status === 'friends')
                this.contactList.appendChild(li);
            else
                this.pendingContactList.appendChild(li);
        });
    }

    async getDataRequest(requestType, targetUsername=null) {
        let url = null;
        if (requestType === 'search_contacts')
            url = `http://localhost:8003/friends/search_contacts/`;
        else if (requestType === 'user_data')
            url = `http://localhost:8000/user/get_user/?q=${targetUsername}`
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
        this.contactBottomNavDiv.addEventListener('click', () => {
            this.contactMenuDiv.style.display = this.contactMenuDiv.style.display === 'none' ? 'block' : 'none';
        });
        this.pendingContactSummary.addEventListener('click', () => {
            this.pendingContactList.style.display = this.pendingContactList.style.display === 'none' ? 'block' : 'none';
        });
        this.contactSummary.addEventListener('click', () => {
            this.contactList.style.display = this.contactList.style.display === 'none' ? 'block' : 'none';
        });
        this.addContact.addEventListener('click', () => {
            app.querySelector('section').innerHTML += '<pop-up-component class="add-new-contact-pop-up"></pop-up-component>' 
        })
        this.searchContactInput.addEventListener('input', () => this.updateContactList());
    }

    async updateContactList() {
        const contactsList = await this.getDataRequest('search_contacts');
        const searchValue = this.searchContactInput.value.toLowerCase();
		if (!searchValue) {
            const displayedUsername = this.getCurrentDisplayedContactUsername();
            const contactListUsername = contactsList.friends.map(contact => contact.username);
            if (!contactListUsername.every(username => displayedUsername.includes(username))) {
                this.contactList.innerHTML = '';
                this.createContactList(contactsList.friends, 'friends');
            }
			return ;
		}
        if (contactsList.friends.length !== 0) {
            const filteredContacts = contactsList.friends.filter(contact => contact.username.toLowerCase().includes(searchValue));
            if (filteredContacts.length !== 0) {
                const filteredUsername = filteredContacts.map(contact => contact.username.toLowerCase());
                const displayedUsername = this.getCurrentDisplayedContactUsername();
                if (filteredContacts.length === contactsList.friends_count && filteredUsername.every(username => displayedUsername.includes(username)))
                    return;
                this.contactList.innerHTML = '';
                this.contactList.classList.remove('no-contacts');
                this.contactSummary.innerHTML = `<p>Contacts-${filteredContacts.length}/${filteredContacts.length} online</p>`;
                this.createContactList(filteredContacts, 'friends');
            } else {
                this.contactList.innerHTML = '';
                this.contactSummary.innerHTML = `<p>Contacts-0/0 online</p>`;
                this.contactList.innerHTML = `No contacts found...`;
                this.contactList.classList.add('no-contacts');
            }
        }
	}

    getCurrentDisplayedContactUsername() {
        const currentContacts = this.contactList.querySelectorAll('contact-component');
        return Array.from(currentContacts).map(contact => contact.userData.username.toLowerCase());    
    }

    // getContactToDisplay(contactsList, searchValue) {
        // const currentContactUsernames = Array.from(this.contactList.querySelectorAll('contact-component'))
        //     .map(contact => contact.userData.username.toLowerCase());
    
    //     const filteredContacts = contactsList.friends.filter(contact => 
    //         contact.username.toLowerCase().includes(searchValue) &&
    //         !currentContactUsernames.includes(contact.username.toLowerCase())
    //     );
    
    //     console.log('actual contact list research: ', contactsList.friends);
    //     console.log('actual display: ', currentContactUsernames);
    //     console.log('new contact list filtered: ', filteredContacts);
    //     return filteredContacts;
    // }

    // deleteObsoleteContact(searchValue) {
    //     const currentContactDisplay = this.contactList.querySelectorAll('li');
    //     currentContactDisplay.forEach(contactComponent => {
    //         const contact = contactComponent.querySelector('contact-component')
    //         const username = contact.userData.username.toLowerCase();
    //         if (!username.includes(searchValue)) {
    //             console.log('deleted display contact: ', username);
    //             contactComponent.remove();
    //         }
    //     })
    // }
}
customElements.define("contact-menu-component", FriendsMenuComponent);
