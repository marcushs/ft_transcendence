import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import './Friendship/FriendshipButtonComponent.js';
import userProfile from "../views/user-profile.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";

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

    async connectedCallback() {        
        const contactPictureUrl = await getProfileImage(this.userData);

        this.innerHTML = `
            <div class="contact-menu-picture">
                <img src='${contactPictureUrl}' alt='contact picture'></img>
            </div>
            <div class="contact-menu-username">
                <p>${this.userData.username}</p>
                <p>${this.userData.status}</p>
            </div>
            <div class="contact-menu-request-icon">
                ${this.generateIcons()}
            </div>
        `;
        this.attachEventListener();
    }
    
    generateIcons() {
        if (this.status === 'contacts-online' || this.status === 'contacts-offline') {
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
        requestIcons.forEach(icon => {
            icon.addEventListener('click', (event) => {
                const action = event.target.getAttribute('id');
                console.log('action: ', action);
                this.handleRequestIconClick(action);
            });
        });
        this.addEventListener('dblclick', () => {
            document.title = this.userData.username + '-profile';
            throwRedirectionEvent(`/users/${this.userData.username}`);
        })
    }

    async handleRequestIconClick(action) {
        const payload = {
            status: action,
            target_username: this.userData.username,
        };
        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                if (action === 'accept')
                    this.sendNotification(this.userData.username, 'friend-request-accepted');
                if (this.closest('ul').className === 'pending-contact-list-result')
                    this.manageChangePendingContact();
                else
                    console.log('in friends list here');
            }
            console.log(data.message);
        } catch (error) {
            console.error('catch: ', error);
        }
    }

    async sendNotification(receiver, type){
        const url = 'http://localhost:8004/notifications/manage_notifications/';
        const payload = {
            receiver: receiver,
            type: type
        };

        try {
            const data = await sendRequest('POST', url, payload);
            if (data.status === 'error')
                console.error(data.message);
        } catch (error) {
            console.error(error.message);
        }
    }

    manageChangePendingContact() {
        const pendingSummary = document.querySelector('.pending-contact-summary');
        const pendingCountMatch = pendingSummary.textContent.match(/\d+/);
        const newPendingCount = parseInt(pendingCountMatch[0], 10) - 1;
        setTimeout(() => this.closest('li').remove(), 200);
        let newPendingSummary = null;
        if (newPendingCount === 0) {
            const segment = pendingSummary.textContent.split(' -');
            newPendingSummary = segment[0];
            const pendingContactList = document.querySelector('.pending-contact-list-result')
            pendingContactList.innerHTML = 'No contacts request...';
            pendingContactList.classList.add('no-contacts');
        } else
            newPendingSummary = pendingSummary.textContent.replace(pendingCountMatch[0], newPendingCount);
        pendingSummary.textContent = newPendingSummary;
    }
}

customElements.define("contact-component", ContactComponent);
