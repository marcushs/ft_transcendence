import getProfileImage from "../../utils/getProfileImage.js";

class ChatRoomTopBar extends HTMLElement {
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
		let status = this.userData.status;

		this.innerHTML = `
			<i class="fa-solid fa-arrow-left"></i>
			<div class="chatroom-profile-picture">
				<img src='${profileImage}' alt='contact picture'></img>
				<div class="chat-status-circle ${status}"></div>
			</div>
			<div class="chat-contact-name-status">
				<p>${this.userData.username}</p>
				<p class="${status}">${status}</p>
			</div>
		`;
	};
}

customElements.define('chatroom-top-bar', ChatRoomTopBar);
