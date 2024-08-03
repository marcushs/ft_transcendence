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
    
    connectedCallback() {
        this.className = this.statusList[this.buttonStatus].class;
        
        this.createHtmlButton();
        this.attachEventListener();
    }

    createHtmlButton() {
        this.innerHTML = '';

        console.log('state: ', this.statusList[this.buttonStatus])
        const buttons = Array.isArray(this.statusList[this.buttonStatus].buttons) ? this.statusList[this.buttonStatus].buttons : [];
        buttons.forEach(buttonConfig => {
            this.innerHTML += `
                <div class="${buttonConfig.text}-button">
                    <p data-payload='${JSON.stringify(buttonConfig.payload)}'>${buttonConfig.text}</p>
                    <img data-payload='${JSON.stringify(buttonConfig.payload)}' src=${buttonConfig.img} alt='${buttonConfig.alt}'></img>
                </div>
            `
        });
    }
 
    attachEventListener() {
        this.querySelectorAll('p, img').forEach(element => {
            element.addEventListener('click', async (event) => {
                this.handleEventListener(event);
            })
        })
    }
    
    handleEventListener(event) {
        this.sendFriendshipRequest(JSON.parse(event.target.dataset.payload));
    }

    async sendFriendshipRequest(payload) {
        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            console.log(data.message);
        } catch (error) {
            console.error('catch: ', error);
        }
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
}

customElements.define("friendship-button-component", FriendshipButtonComponent);
