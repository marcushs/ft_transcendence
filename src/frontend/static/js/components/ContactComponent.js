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
            <div class="status-circle">
            </div>
            <div class="contact-menu-info">
                <p>${this.userData.username}</p>
                <p>${this.userData.status}</p>
            </div>
            `;
        if (this.status === 'received_requests') {
            this.innerHTML += `
                <div class="contact-menu-request-icon">
                    <i class="fa-solid fa-check" id='accept'></i>
                    <i class="fa-solid fa-xmark" id="decline"></i>
                </div>
            `
        } else {
            this.innerHTML += `
                <div class='contact-show-action-button'>
                    yo
                    <img src='' alt=''></img>
                </div>
                <div class='contact-action-list'>
                    <ul>
                        <li class='contact-action-send-message'>Send Message</li>
                        <hr>
                        <li class='contact-action-invite-play'>Invite to play</li>
                        <hr>
                        <li class='contact-action-remove-contact'>Remove contact</li>
                        <hr>
                        <li class='contact-action-see-profile'>See profile</li>
                    </ul>
                </div>
            `
            this.contactActionList = this.querySelector('.contact-action-list');
            this.contactActionList.style.display = 'none';
            this.querySelector('.contact-action-list').style.display = 'none'
        }
        if (this.userData.status === 'online')
            this.querySelector('.status-circle').classList.add('online-status-circle')
        else if (this.userData.status === 'offline')
            this.querySelector('.status-circle').classList.add('offline-status-circle')
        else if (this.userData.status === 'away')
            this.querySelector('.status-circle').classList.add('away-status-circle')
        this.attachEventListener();
    }

    attachEventListener() {
        const showActionsButton = this.querySelector('.contact-show-action-button');
        if (showActionsButton) {
            showActionsButton.addEventListener('click', (event) => {
                this.contactActionList.style.display = this.contactActionList.style.display === 'none'  ? 'block' : 'none';
                this.throwCloseActionsMenuEvent(this);
                event.stopPropagation();
            });
        }

        document.addEventListener('closeActionMenu', (event) => {

            if (event.detail.senderInstance !== this && this.contactActionList.style.display === 'block')
                this.contactActionList.style.display = 'none';
        })
        const requestIcons = this.querySelectorAll('i');
        if (requestIcons) {
            requestIcons.forEach(icon => {
                icon.addEventListener('click', (event) => {
                    const action = event.target.getAttribute('id');
                    this.handleRequestIconClick(action);
                });
            });
        }

        if (this.contactActionList) {  
            document.addEventListener('click', () => {
                if (getComputedStyle(this.contactActionList).display === 'block')
                    this.contactActionList.style.display = 'none';
            });
        }

        // this.addEventListener('dblclick', () => {
        //     document.title = this.userData.username + '-profile';
        //     throwRedirectionEvent(`/users/${this.userData.username}`);
        // })
    }

    async handleRequestIconClick(action) {
        const payload = {
            status: action,
            target_username: this.userData.username,
        };
        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
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

    throwCloseActionsMenuEvent (senderInstance) {
        const event = new CustomEvent('closeActionMenu', {
            bubbles: true,
            detail: {
                senderInstance: senderInstance
            }
        });
    
        document.dispatchEvent(event);
    }
}

customElements.define("contact-component", ContactComponent);
