import { sendRequest } from "../utils/sendRequest.js";

class FriendsMenuComponent extends HTMLElement {
    constructor() {
        super();
        this.initComponent();
    }

    initComponent() {
        this.innerHTML = `
            <div class='bottom-nav-contacts'>
                <p>Contacts</p>
                <img src='../../assets/contact.svg' alt='contact-icon'></img>
            </div>
            <div class='contact-menu'>
                <div class='top-bar-contacts-menu'>
                    <div class='add-contact'>
                        <img src='../../assets/add_friend.svg' alt='add-friend-icon'></img>
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
        `

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

    connectedCallback() {
        this.displayContactList();
        this.attachEventListener();
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
        const contacts = await this.getContacts();
        if (!contacts) {
            this.contactSummary.innerHTML = `<p>Contacts  -  0/0</p>`;
            this.contactList.innerHTML = `No contacts found...`
            this.pendingContactSummary.innerHTML = `<p>Pending  -  0</p>`;
            this.pendingContactList.innerHTML = `No pending request...`
        } else {
            this.contactSummary.innerHTML = `<p>Friends - ${contacts.friends_count}/${contacts.friends_count}</p>`;
            if (contacts.friends_count === 0)
                this.contactList.innerHTML = `No contacts found...`
            else {
                contacts.friends.forEach(user => {
                    console.log('username friend: ', user.username)
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <p>${user.username}</p>
                        <img src='' alt='' class='search-contact-picture'></img>
                    `
                    this.contactList.appendChild(li);
                });
            }
            this.pendingContactSummary.innerHTML = `<p> Pending - ${contacts.requests_count}</p>`;
            if (contacts.requests_count === 0)
                this.pendingContactList.innerHTML = `No pending request...`
            else {
                contacts.sent_requests.forEach(user => {
                    console.log('username sent: ', user.username)
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <p>${user.username}</p>
                        <img src='' alt='' class='search-contact-picture'></img>
                    `
                    this.pendingContactList.appendChild(li);
                });
                contacts.received_requests.forEach(user => {
                    console.log('username received: ', user.username)
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <p>${user.username}</p>
                        <img src='' alt='' class='search-contact-picture'></img>
                    `
                    this.pendingContactList.appendChild(li);
                });
            }
        }
    }

    async getContacts() {
        const url = `http://localhost:8003/friends/search_contacts/`
        try {
            const data = await sendRequest('GET', url, null);
            if (data.status === 'success') {
                console.log(data.message);
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

    // createComponentHtml() {
    //     this.innerHTML = `
    //         <div class='bottom-nav-contacts-button'>
    //             <p>Contacts</p>
    //             <img src='../../assets/friend.png' alt='friend-icon'></img>
    //         </div>
    //         <div class='contact-menu'>
    //             <div class='top-bar-contacts-menu'>
    //                 <div class='add-contact'>
    //                     <img src='../../assets/add_friend.png' alt='add-friend-icon'></img>
    //                 </div>
    //                 <div class='search-contact'>
    //                     <form action="#" autocomplete="off">
    //                     <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
    //                     <div class="search-contact-input-container">
    //                         <input type="text" placeholder="Search contact" id="search-contact-input"/>
    //                     </div>
    //                     </form>
    //                 </div>
    //             </div>
    //             <div class='contact-list-menu'>
    //                 <p class='contact-summary'></p>
    //                 <ul class="contact-list-result"></ul>
    //             </div>
    //         </div>
    //     `
    // }
}

customElements.define("contact-menu-component", FriendsMenuComponent);
