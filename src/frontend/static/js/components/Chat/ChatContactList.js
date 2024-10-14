import "./ChatContactComponent.js"
import { sendRequest } from "../../utils/sendRequest.js";

class ChatContactList extends HTMLElement {
	static get observedAttributes() {
        return ["data-count"];
    };

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'data-count')
			this.count = parseInt(newValue, 10);
	}

	constructor() {
		super();
		this.count = 0;
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<div class='contacted-list'>
				<div class="list-header">
					<div class='plus-sign'>
						<div class="horizontal-line"></div>
						<div class="vertical-line"></div>
					</div>
					<p class="title">Contacted</p>
					<p id="chat-contact-count" class="count" data-count="0">(${this.count})</p>
					</div>
				<ul>
					<p class="no-contact-text">No recent message</p>
				</ul>
			</div>
		`;
	}

	captitalize(str) {
		return str[0].toUpperCase() + str.slice(1)
	}

	addEventListeners() {
		this.contactedList = this.querySelector('.contacted-list');
		this.listHeader = this.querySelector('.list-header');
		this.plusSign = this.querySelector('.plus-sign');

		this.listHeader.addEventListener('mouseenter', () => this.plusSign.classList.add('hover'));
		this.listHeader.addEventListener('mouseleave', () => this.plusSign.classList.remove('hover'));
		this.listHeader.addEventListener('click', () => {
			this.contactedList.classList.toggle('active');
		});
	}
}

customElements.define('chat-contact-list', ChatContactList);
