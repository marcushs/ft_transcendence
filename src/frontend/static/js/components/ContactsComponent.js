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
                        <img src='../../assets/add_friend.png' alt='add-friend-icon'></img>
                    </div>
                    <div class='search-contact'>
                        <form action="#" autocomplete="off">
                        <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                        <div class="search-contact-input-container">
                            <input type="text" placeholder="Search contact" id="search-contact-input"/>
                        </div>
                        </form>
                    </div>
                </div>
                <div class='contact-list-menu'>
                    <p class='contact-summary'></p>
                    <ul class="contact-list-result"></ul>
                </div>
            </div>
        `

        this.addContact = this.querySelector('.add-contact');
        this.contactList = this.querySelector('.contact-list-result');
        this.contactMenuDiv = this.querySelector('.contact-menu');
        this.contactSummary = this.querySelector('.contact-summary');
        this.searchContactInput = this.querySelector('#search-contact-input');
        this.contactBottomNavDiv = this.querySelector('.bottom-nav-contacts');

        this.contactMenuDiv.style.display = 'none';
    }

    connectedCallback() {
        this.displayContactList();
        this.attachEventListener();
    }

    attachEventListener() {
        this.contactBottomNavDiv.addEventListener('click', () => {
            this.contactMenuDiv.style.display = this.contactMenuDiv.style.display === 'none' ? 'block' : 'none';
        });
    }

    async displayContactList() {
        // const contacts = await this.getContacts();
        const contacts = null;
        if (!contacts) {
            this.contactSummary.innerHTML = `<p>Friends - 0/0</p>`;
            this.contactList.innerHTML = `No contacts found...`
        } else {
            this.contactSummary.innerHTML = `<p>Friends - ${contacts.onlineContactCount}/${contacts.contactCount}</p>`;
            contacts.forEach(user => {
                console.log('username: ', user.username)
                const li = document.createElement('li');
                li.innerHTML = `
                    <p>${user.username}</p>
                    <img src='' alt='' class='search-contact-picture'></img>
                `
                li.onclick(event => {
                    // redirect to user profile here
                })
                this.contactList.appendChild(li);
            });
        }
    }

    async getContacts() {
        const url = `http://localhost:8003/friends/search_contact/?q=${encodeURIComponent(this.searchInput.value)}`
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
