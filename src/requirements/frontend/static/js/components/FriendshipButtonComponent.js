import { sendRequest } from "../utils/sendRequest.js";

class FriendshipButtonComponent extends HTMLElement {
    static get observedAttributes() {
        return ["button-status"];
    }

    constructor() {
        super();
        this.buttonStatus = null;
        this.createStatusList();
        this.innerHTML = `
            <p></p>
            <img src="" alt="">
        `;
        this.attachEventListener();
    }

    connectedCallback() {
        this.requestUrl = 'http://friends:8000/friends/manage-friendship/'
        this.querySelector('p').innerHTML = this.statusList[this.buttonStatus].text;
        this.querySelector('img').src = this.statusList[this.buttonStatus].imgLink;
        console.log('button-status: ', this.buttonStatus);
        console.log('class: ', this.className);
        this.className = this.statusList[this.buttonStatus].class;
        this.attachEventListener();
    }
 
    attachEventListener() {
        this.addEventListener('click', async (event) => {
            if (this.buttonStatus !== 'own_profile') {
                response = await this.sendFriendshipRequest(this.statusList[this.buttonStatus].payload);
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'button-status') {
            this.buttonStatus = newValue;
            this.className = this.statusList[this.buttonStatus].class;
        }
    }

    setClass(newState) {
        this.currentState = newState;
    }

    async sendFriendshipRequest(payload) {
        try {
            const data = await sendRequest(type='POST', url=this.requestUrl, payload=payload);
            if (data.status === 'success') {
                return data.message;
            } else {
                console.log(data.message);
                return null
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    createStatusList() {
        this.statusList = {
            own_profile: {
                class: 'hide-button',
                buttons: '',
            },
            pending_sent: {
                class: 'pending-sent-button',
                buttons: [
                    { payload: {status: 'cancel'}, text: 'Cancel', imgLink: '' }
                ]
            },
            pending_received: {
                class: 'pending-received-button',
                buttons: [
                    { payload: {status: 'accept'}, text: 'Accept', imgLink: '' },
                    { payload: {status: 'decline'}, text: 'Decline', imgLink: '' },
                ]
            },
            mutual_friend: {
                class: 'remove-friend-button',
                buttons: [
                    { payload: {status: 'remove'}, text: 'Remove', imgLink: '' }
                ]
            },
            not_friend: {
                class: 'add-friend-button',
                buttons: [
                { payload: {status: 'add'}, text: 'Add', imgLink: '' }
                ]
            },
        }
    }
}

customElements.define("friendship-button-component", FriendshipButtonComponent);
