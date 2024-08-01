import { getCookie } from "../utils/cookie.js";

class FriendshipButtonComponent extends HTMLElement {
    static get observedAttributes() {
        return ["button-status"];
    }

    constructor() {
        super();
        this.buttonStatus = null;
        this.statusList = {
            self: {class: 'self', request: self, text: '', imgLink: ''},
            pending: {class: 'css', request: null},
            friend: {class: 'css', request: null},
            notfriend: {class: 'addfriend', request: null},
        }
        this.innerHTML = `
            <p></p>
            <img src="" alt="">
        `;
        this.attachEventListener();
    }

    // test() {
    //     this.statusList[this.buttonStatus].request();
    //     this.className = this.statusList[this.buttonStatus].class;
    // }

    connectedCallback() {
        this.querySelector('p').innerHTML = this.statusList[this.buttonStatus].text;
        this.querySelector('img').src = this.statusList[this.buttonStatus].imgLink;
        this.className = this.statusList[this.buttonStatus].class;
        console.log(this.buttonStatus, this.className);
        this.attachEventListener();
    }

    async attachEventListener() {
        this.addEventListener('click', (event) => {
            this.statusList[this.buttonStatus].request()
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'button-status') {
            this.buttonStatus = newValue;
            this.className = this.statusList[this.buttonStatus].class;
            this.style.background = "yellow"
        }
    }

    setClass(newState) {
        this.currentState = newState;
    }
}

customElements.define("friendship-button-component", FriendshipButtonComponent);
