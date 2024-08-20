import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import './Friendship/FriendshipButtonComponent.js';

class ContactComponent extends HTMLElement {
    
    static get observedAttributes() {
        return ["data-user", "data-status"];
    }

    attributeChangedCallback(name, oldValue, newValue) {    
        if (name === 'data-user')
            this.userData = JSON.parse(newValue);
        if (name === 'data-status')
            this.status = newValue;
    }

    constructor() {
        super();

        this.userData = null;
        this.status = null;
    }

    connectedCallback() {
        const contactPictureUrl = getProfileImage(this.userData);

        this.innerHTML = `
            <div class="contact-menu-picture">
                <img src='${contactPictureUrl}' alt='contact picture'></img>
            </div>
            <div class="contact-menu-username">
                <p>${this.userData.username}</p>
            </div>
            <div class="contact-menu-request-icon">
                ${this.generateIcons()}
            </div>
        `;
        this.attachEventListener();
    }
    
    generateIcons() {
        if (this.status === 'friends') {
            return `<i class="fa-solid fa-xmark" id='remove'></i>`;
        } else if (this.status === 'sent_requests') {
            return `<i class="fa-solid fa-xmark" id='cancel'></i>`
        } else if (this.status === 'received_requests') {
            return `
                <i class="fa-solid fa-check" id='accept'></i>
                <i class="fa-solid fa-xmark" id="decline"></i>
            `;
        }
    }

    attachEventListener() {
        const requestIcons = this.querySelectorAll('i');
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

}

customElements.define("contact-component", ContactComponent);
