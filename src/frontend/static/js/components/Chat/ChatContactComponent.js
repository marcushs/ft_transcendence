import getProfileImage from "../../utils/getProfileImage.js";

class ChatContactComponent extends HTMLElement {
	static get observedAttributes() {
        return ["data-user", "data-status"];
    };

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'data-user') {
			this.userData = JSON.parse(newValue);
			this.render();
		}
		if (name === 'data-status')
			this.status = newValue;
	}

	constructor() {
		super();
		this.userData = null;
	};

	async render() {
		let profileImage = await getProfileImage(this.userData);

		this.innerHTML = `
		<div class="chat-contact-profile-picture">
			<img src=${profileImage} alt='contact picture'></img>
			<div class="chat-status-circle online"></div>
		</div>
		<div class="chat-contact-info">
			<p>${this.userData.username}</p>
			<p>This is an example message This is an example message This is an example message </p>
		</div>
		<div class="message-status">
			<div class="last-message-datetime">
				<span>18:39</span>
			</div>
			<div class="unread-message-count-circle"></div>
			<i class="fa-solid fa-check"></i>
			<div class="double-check">
				<i class="fa-solid fa-check"></i>
				<i class="fa-solid fa-check"></i>
			</div>
		</div>
		`;
	};

}

customElements.define('chat-contact-component', ChatContactComponent);
