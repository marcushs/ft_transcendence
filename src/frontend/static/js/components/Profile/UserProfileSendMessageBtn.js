import { sendMessageCallback } from "../../utils/chatUtils/sendMessageCallback.js";

export default class UserProfileSendMessageBtn extends HTMLElement {
	constructor(userData) {
		super();
		this.userData = userData;
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<p>
				<span>Send Message</span>
				<i class="fa-regular fa-paper-plane"></i>
			</p>
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
