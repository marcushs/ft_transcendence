import getProfileImage from "../../utils/getProfileImage.js";
import { sendRequest } from "../../utils/sendRequest.js";

export default class ChatRoomTopBar extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-status"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
		console.log(newValue)
        if (name === 'data-user')
            this.userData = JSON.parse(newValue);
        if (name === 'data-status')
            this.status = newValue;
	}

	constructor() {
		super();

		this.userData = null;
	};

	async connectedCallback() {
        await this.render();
    }

	async render() {
		let profileImage = await getProfileImage(this.userData);
		let status = await this.getUserStatus();

		this.innerHTML = `
			<i id="chatroom-back-btn" class="fa-solid fa-arrow-left"></i>
			<div class="chatroom-profile-picture" style="background: no-repeat center/100% url('${profileImage}')">
				<div class="chat-status-circle ${status}"></div>
			</div>
			<div class="chat-contact-name-status">
				<p>${this.userData.username}</p>
				<p class="${status}">${status}</p>
			</div>
			<div class="chat-block-user">
				<i class="fa-solid fa-ban"></i>
				<p>Block ${this.userData.username}</p>
			</div>
		`;

	};

	async getUserStatus() {
		try {
			console.log('chatroom top bar: ', this.userData.id)
			let res = await sendRequest('GET', `/api/user/get_user_status/?userId=${this.userData.id}`, null, false);
			
			console.log('chatroom top bar: ', res.user_status)
			return res.user_status;
		} catch (error) {
		}
	}
}

customElements.define('chatroom-top-bar', ChatRoomTopBar);
