import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import './Friendship/FriendshipButtonComponent.js';
import userProfile from "../views/user-profile.js";
import { getString } from "../utils/languageManagement.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import { sendMessageCallback } from "../utils/sendMessageCallback.js";

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
        await this.setRender();
        this.attachEventListener();
    }

    async setRender() {
        const contactPictureUrl = await getProfileImage(this.userData);

        
        this.innerHTML = `
            <div class="contact-menu-picture">
                <img class='contact-picture' src='${contactPictureUrl}' alt='contact picture'></img>
            </div>
            <div class="status-circle">
            </div>
            <div class="contact-menu-info">
                <p class='contact-username'>${this.userData.username}</p>
                <p class='contact-status'></p>
            </div>
        `;
        const status = this.querySelector('.contact-status');
        
        if (this.userData.status === 'online')
            status.textContent = getString('contactComponent/onlineStatus');
        else if (this.userData.status === 'away')
            status.textContent = getString('contactComponent/awayStatus');
        else if (this.userData.status === 'offline')
            status.textContent = getString('contactComponent/offlineStatus');
        this.setContactActionHTML();
        this.setContactStatusCircleHTML();
    }

    setContactActionHTML() {
        if (this.status === 'received_requests') {
            this.innerHTML += `
                <div class="contact-menu-request-icon">
                    <i class="fa-solid fa-check" id='accept'></i>
                    <i class="fa-solid fa-xmark" id="decline"></i>
                </div>
            `
        } else if (this.status === 'sent_requests') {
            this.innerHTML += `
                <div class="contact-menu-request-icon">
                    <i class="fa-solid fa-xmark" id="cancel"></i>
                </div>
            `
        } else {
            this.innerHTML += `
                <div class='contact-action-menu'>
                    <i class="fa-solid fa-caret-up"></i>
                    <div class='contact-action-list'>
                        <ul>
                            <li class='contact-action-send-message'>${getString('contactComponent/sendMessageAction')}</li>
                            <hr>
                            <li class='contact-action-invite-play'>${getString('contactComponent/inviteToPlayAction')}</li>
                            <hr>
                            <li class='contact-action-remove-contact'>${getString('contactComponent/removeContactsAction')}</li>
                            <hr>
                            <li class='contact-action-see-profile'>${getString('contactComponent/seeProfileAction')}</li>
                        </ul>
                    </div>
                </div>
                `;
            this.showActionsList = this.querySelector('.contact-action-menu i');
            this.contactActionList = this.querySelector('.contact-action-list');
            this.contactActionList.style.display = 'none';
        }
    }

    setContactStatusCircleHTML() {
        if (this.userData.status === 'online')
            this.querySelector('.status-circle').classList.add('online-status-circle')
        else if (this.userData.status === 'offline')
            this.querySelector('.status-circle').classList.add('offline-status-circle')
        else if (this.userData.status === 'away')
            this.querySelector('.status-circle').classList.add('away-status-circle')
    }

    attachEventListener() {
        this.handleShowActionMenuEvent();
        this.handleCloseActionMenuEvent();
        this.handlePendingRequestEvent();
        this.handleContactActionsEvent();
    }

    handleShowActionMenuEvent() {
        if (this.showActionsList) {
            this.showActionsList.addEventListener('click', (event) => {
                this.contactActionList.style.display = this.contactActionList.style.display === 'none'  ? 'block' : 'none';
                if (this.showActionsList.classList[1] === 'fa-caret-up')
                    this.showActionsList.classList.replace('fa-caret-up', 'fa-caret-down');
                else
                    this.showActionsList.classList.replace('fa-caret-down', 'fa-caret-up');
                this.throwCloseActionsMenuEvent(this);
                event.stopPropagation();
            });
        }
    }

    handleCloseActionMenuEvent() {
        if (this.contactActionList) {  
            document.addEventListener('closeActionMenu', (event) => {
                if (event.detail.senderInstance !== this && this.contactActionList.style.display === 'block') {
                    this.contactActionList.style.display = 'none';
                    this.showActionsList.classList.replace('fa-caret-down', 'fa-caret-up');
                }
            })

            document.addEventListener('click', () => {
                if (getComputedStyle(this.contactActionList).display === 'block') {
                    this.contactActionList.style.display = 'none';
                    this.showActionsList.classList.replace('fa-caret-down', 'fa-caret-up');
                }
            });
        }
    }

    handlePendingRequestEvent() {
        const requestIcons = this.querySelectorAll('i:not(.contact-action-menu i)');
 
        if (requestIcons) {
            requestIcons.forEach(icon => {
                icon.addEventListener('click', (event) => {
                    const action = event.target.getAttribute('id');
                    this.handleRequestIconClick(action);
                });
            });
        }
    }

    handleContactActionsEvent() {
        const contactActions = this.querySelectorAll('.contact-action-list li');

        contactActions.forEach(action => {
            action.addEventListener('click', () => {
                switch (action.classList[0]) {
                    case 'contact-action-send-message':
                        sendMessageCallback(this.userData);
                        console.log(`TEST: Send message to contact \'${this.userData.username}\' successfully reached`);
                        break;
                    case 'contact-action-invite-play':
                        console.log(`TEST: Invite contact \'${this.userData.username}\' to play successfully reached`);
                        break;
                    case 'contact-action-remove-contact':
                        this.handleRequestIconClick('remove');
                        break;
                    case 'contact-action-see-profile':
                        document.title = this.userData.username + '-profile';
                        throwRedirectionEvent(`/users/${this.userData.username}`);
                        break;
                    default:
                        console.error(`Unknown contact action`);
                        break;
                }         
            })
        })  
    }
 
    async handleRequestIconClick(action) {
        const payload = {
            status: action,
            target_username: this.userData.username,
        };
        try {
            await sendRequest('POST', '/api/friends/manage_friendship/', payload);
        } catch (error) {
            console.error('catch: ', error);
        }
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
