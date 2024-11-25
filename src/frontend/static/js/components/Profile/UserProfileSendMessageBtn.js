import { sendMessageCallback } from "../../utils/chatUtils/sendMessageCallback.js";
import {getString} from "../../utils/languageManagement.js";

export default class UserProfileSendMessageBtn extends HTMLElement {
	constructor(userData) {
		super();
		this.userData = userData;
		this.render();
		this.id = "sendMsgBtn";
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<p id="sendMsgBtnP">${getString("sendMessageButton")}</p>
			<i class="fa-regular fa-paper-plane"></i>
		`;
	}

	addEventListeners() {
		this.addEventListener('mouseenter', () => {
			this.classList.add('hover');
		});
		this.addEventListener('mouseleave', () => {
			this.classList.remove('hover');
		})
		this.addEventListener('mousedown', () => {
			this.style.transform = 'scale(0.98)';
			sendMessageCallback(this.userData)
		})
		this.addEventListener('mouseup', () => {
			this.style.transform = 'scale(1)';
		})
	}
}

customElements.define('user-profile-send-message-btn', UserProfileSendMessageBtn);
