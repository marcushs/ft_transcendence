import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import './Friendship/FriendshipButtonComponent.js';

class ContactComponent extends HTMLElement {
    
    static get observedAttributes() {
        return ["data-user", "data-status"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log('changedccccc');
        
        if (name === 'data-user') {
            console.log(newValue);
            console.log(JSON.parse(newValue));
            
            this.userData = JSON.parse(newValue);
        }
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
    }
    
    generateIcons() {
        if (this.status === 'friends') {
            return `<i class="fa-solid fa-xmark" id='remove'></i>`;
        } else if (this.status === 'sent_requests') {
            return `<i class="fa-solid fa-xmark" id='cancel'></i>`
        } else if (this.status === 'received_requests') {
            return `
                <i class="fa-solid fa-check"></i>
                <i class="fa-solid fa-xmark" id="decline"></i>
            `;
        }
    }

}

customElements.define("contact-component", ContactComponent);
