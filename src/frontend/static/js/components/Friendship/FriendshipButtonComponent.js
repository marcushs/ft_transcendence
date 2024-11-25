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
                    <p>${buttonConfig.text}</p>
                    <img src='${buttonConfig.img}' alt='${buttonConfig.alt}'></img>
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
            ...JSON.parse(event.currentTarget.dataset.payload),
            target_username: targetUsername,
        }
        this.sendFriendshipRequest(payload);
    }

    async sendFriendshipRequest(payload) {
        try {
            const data = await sendRequest('POST', '/api/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                const username = document.querySelector('.users-profile-page .user-info .username');

                if (username && this.buttonStatus === "not_friend")
                    await this.sendNotification(username.innerHTML, 'friend-request-pending');
                this.setAttribute('button-status', data.friendship_status);
            }
        } catch (error) {
            console.error(error);
        }
    }

    setClass(newState) {
        this.currentState = newState;
    }

    async sendNotification(receiver, type){
        const url = '/api/notifications/manage_notifications/';
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
}

customElements.define("friendship-button-component", FriendshipButtonComponent);
