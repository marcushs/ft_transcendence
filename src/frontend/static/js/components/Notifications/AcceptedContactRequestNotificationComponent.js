import {convertDateFormat} from "../../utils/convertDateFormat.js";
import {getString} from "../../utils/languageManagement.js";

class AcceptedContactRequestNotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.notificationObj = null;
	}


	initializeComponent() {
		this.notificationCreateAt = new Date(this.notificationObj.created_at);

		this.innerHTML = `
			<li>
				<p><span>${this.notificationObj.sender}</span> ${getString('notificationsComponent/acceptedNotificationSuffix')}</p>
				<p class="notification-date">${convertDateFormat(this.notificationCreateAt)}</p>
				<hr>
			</li>
		`;
	}


	connectedCallback() {
		this.notificationObj = JSON.parse(this.getAttribute('notificationObj'));
		this.initializeComponent();
		this.setNotificationClass();
		this.reloadDateEachSeconds();
	}


	setNotificationClass() {
		const li = this.querySelector('li');

		if (!this.notificationObj.is_read)
			li.className = 'unread-notification';
	}


	reloadDateEachSeconds() {
		const dateElement = this.querySelector('.notification-date');

		setInterval(() => {
			dateElement.textContent = convertDateFormat(this.notificationCreateAt);
		}, 1000)
	}

}

customElements.define('accepted-contact-request-notification-component', AcceptedContactRequestNotificationComponent);