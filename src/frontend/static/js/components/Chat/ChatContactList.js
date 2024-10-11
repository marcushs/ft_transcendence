import "./ChatContactComponent.js"

class ChatContactList extends HTMLElement {
	static get observedAttributes() {
		return ['title'];
	}

	constructor() {
		super();
		this.title = this.getAttribute('title');
		this.onlineCount = 0;
		this.offlineCount = 0;
		this.render();
		// this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<div class='${this.title}-list active'>
				<div class="list-header">
					<div class='plus-sign'>
						<div class="horizontal-line"></div>
						<div class="vertical-line"></div>
					</div>
					<p class="title">${this.captitalize(this.title)} Friends</p>
					<p class="count">(${this.onlineCount})</p>
				</div>
				<ul>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
					<li><chat-contact-component></chat-contact-component></li>
				</ul>
			</div>
		`;
	}

	captitalize(str) {
		return str[0].toUpperCase() + str.slice(1)
	}
}

customElements.define('chat-contact-list', ChatContactList);