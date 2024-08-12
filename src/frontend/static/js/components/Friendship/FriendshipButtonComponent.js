import { handleRedirection } from "../../utils/handleRedirection.js";
import { sendRequest } from "../../utils/sendRequest.js";
import { createButtonStatusList } from "./friendshipUtils.js";

class FriendshipButtonComponent extends HTMLElement {
    static get observedAttributes() {
        return ["button-status"];
    }

    constructor() {
        super();
        this.statusList = createButtonStatusList();
        this.buttonStatus = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'button-status' && oldValue !== newValue) {
            this.buttonStatus = newValue;
            this.createHtmlButton();
            this.attachEventListener();
        }
    }

    createHtmlButton() {
        this.innerHTML = '';

        const buttons = Array.isArray(this.statusList[this.buttonStatus].buttons) ? this.statusList[this.buttonStatus].buttons : [];
        buttons.forEach(buttonConfig => {
            this.innerHTML += `
                <div data-payload='${JSON.stringify(buttonConfig.payload)}' class="${buttonConfig.class}">
                    <p data-payload='${JSON.stringify(buttonConfig.payload)}'>${buttonConfig.text}</p>
                    <img data-payload='${JSON.stringify(buttonConfig.payload)}' src=${buttonConfig.img} alt='${buttonConfig.alt}'></img>
                </div>
            `
        });
    }
 
    attachEventListener() {
        this.querySelectorAll('div').forEach(element => {
            element.addEventListener('click', async (event) => {
                this.handleEventListener(event);
            })
        })
    }
    
    handleEventListener(event) {
        const targetUsername = localStorage.getItem('users-profile-target-username');
        const payload = {
            ...JSON.parse(event.target.dataset.payload),
            target_username: targetUsername,
        }
        this.sendFriendshipRequest(payload);
    }

    async sendFriendshipRequest(payload) {
        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                // this.buttonStatus = data.friendship_status;
                this.setAttribute('button-status', data.friendship_status);
            }
            console.log(data.message);
            // handleRedirection('users-profile', localStorage.getItem('users-profile-target-username'));
        } catch (error) {
            console.error('catch: ', error);
        }
    }

    setClass(newState) {
        this.currentState = newState;
    }
}

customElements.define("friendship-button-component", FriendshipButtonComponent);
