import './ContactComponent.js';
import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import './Friendship/FriendshipButtonComponent.js';

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
    }
    
    async connectedCallback() {
        await this.displayContactList();
        this.attachEventListener();
        this.attachRequestIconsListener();
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
    }

    async displayContactList() {        
        console.log('testtettt');
        
        const contacts = await this.getContacts();
        if (!contacts) {
            this.contactSummary.innerHTML = `<p>Contacts  -  0/0</p>`;
            this.contactList.innerHTML = `No contacts found...`;
            this.contactList.classList.add('no-contacts');
            this.pendingContactSummary.innerHTML = `<p>Pending  -  0</p>`;
            this.pendingContactList.innerHTML = `No pending request...`;
            this.pendingcontactList.classList.add('no-contacts');
        } else {
            this.contactSummary.innerHTML = `<p>Friends - ${contacts.friends_count}/${contacts.friends_count}</p>`;
            if (contacts.friends_count === 0) {
                this.contactList.innerHTML = `No contacts found...`;
                this.contactList.classList.add('no-contacts');
            }
            else {
                contacts.friends.forEach(async user => {
                    const contactData = await this.getUserData(user.username);
                    const li = document.createElement('li');
                    console.log(JSON.parse(JSON.stringify(contactData)));
                    li.innerHTML = `
                        <contact-component data-user='${JSON.stringify(contactData)}' data-status="friends"></contact-component>
                    `;
                    this.contactList.appendChild(li);
                });
            }
            this.pendingContactSummary.innerHTML = `<p> Pending - ${contacts.requests_count}</p>`;
            if (contacts.requests_count === 0) {
                this.pendingContactList.innerHTML = `No pending request...`
                this.pendingContactList.classList.add('no-contacts');
            }
            else {
                contacts.sent_requests.forEach(async user => {
                    const contactData = await this.getUserData(user.username);
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <contact-component data-user='${JSON.stringify(contactData)}' data-status="sent_requests"></contact-component>
                    `;
                    this.pendingContactList.appendChild(li);
                });
                contacts.received_requests.forEach(async user => {
                    console.log('username received: ', user.username)
                    const contactData = await this.getUserData(user.username);
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <contact-component data-user='${JSON.stringify(contactData)}' data-status="received_requests"></contact-component>
                    `;
                    this.pendingContactList.appendChild(li);
                });
            }
        }
        console.log('2');
    }

    attachRequestIconsListener() {
        console.log('1');
        const requestIcons = this.querySelectorAll('.contact-menu-request-icon');
        console.log('requestIcons: ', requestIcons);
        requestIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const action = event.target.getAttribute('id');
                console.log('action: ', action);
                const username = event.target.closest('li').querySelector('p').textContent;
                this.handleRequestIconClick(username, action);
            });
        });
    }

    async handleRequestIconClick(username, action) {
        const payload = {
            status: action,
            target_username: username,
        };
        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                this.setAttribute('button-status', data.friendship_status);
            }
            console.log(data.message);
        } catch (error) {
            console.error('catch: ', error);
        }
    }

    async getContacts() {
        const url = `http://localhost:8003/friends/search_contacts/`
        try {
            const data = await sendRequest('GET', url, null);
            if (data.status === 'success') {
                console.log('back response: ', data.message);
                return data.message;
            } else {
                console.log(data.message);
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getUserData(targetUsername) {
        const url = `http://localhost:8000/user/get_user/?q=${targetUsername}`
        try {
            const data = await sendRequest('GET', url, null);
            if (data.status === 'success') {
                return data.message;
            } else {
                console.log(data.message);
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

customElements.define("contact-menu-component", FriendsMenuComponent);
