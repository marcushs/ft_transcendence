import {sendRequest} from "../../utils/sendRequest.js";
import {sendNotification} from "../../utils/sendNotification.js";

class PendingContactRequestNotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.notificationObj = null;
	}

	initializeComponent() {
		const date = new Date(this.notificationObj.created_at);

		// this.convertDateFormat(date);
		this.innerHTML = `
			<li>			
				<p>${this.notificationObj.message}</p>
				<i class="fa-solid fa-check"></i>
				<i class="fa-solid fa-xmark"></i>
				<p class="notification-date">${this.convertDateFormat(date)}</p>
				<hr>
			</li>
		`;
	}


	convertDateFormat(date) {
		const currentDate = new Date();
		const diffInMs = currentDate - date;

		const diffObj = {
			seconds: Math.floor((diffInMs / 1000) % 60),
			minutes: Math.floor((diffInMs / (1000 * 60)) % 60),
		    hours: Math.floor((diffInMs / (1000 * 60 * 60)) % 24),
		    days: Math.floor((diffInMs / (1000 * 60 * 60 * 24)) % 7)
		}

		if (diffObj.days >= 7)
			return `${date.toLocaleDateString()}`;
		if (diffObj.days >= 1)
			return `${diffObj.days}d`;
		if (diffObj.hours >= 1)
			return `${diffObj.hours}h`;
		if (diffObj.minutes >= 1)
			return `${diffObj.minutes}m`;
		return `${diffObj.seconds}s`;
	}


	connectedCallback() {
		this.notificationObj = JSON.parse(this.getAttribute('notificationObj'));
		// console.log(this.notificationObj)
		this.initializeComponent();
		this.setNotificationClass();
		this.attachEventsListener();
	}


	attachEventsListener() {
		this.querySelector('.fa-check').addEventListener('click',  event => this.handleClickContactRequest('accept'));
		this.querySelector('.fa-xmark').addEventListener('click',  event => this.handleClickContactRequest('decline'));
	}


	setNotificationClass() {
		const li = this.querySelector('li');

		if (!this.notificationObj.is_read)
			li.className = 'no-viewed-notification';
	}


	async handleClickContactRequest(action) {
		const payload = {
	            status: action,
	            target_username: this.notificationObj.sender,
        };

        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                if (action === 'accept')
                    sendNotification(this.notificationObj.sender, 'friend-request-accepted');
				await sendRequest('DELETE', 'http://localhost:8004/notifications/manage_notifications/', { uuid: this.notificationObj.uuid });
            }
        } catch (error) {
            console.error('catch: ', error);
        }
	}

}

customElements.define('pending-contact-request-notification-component', PendingContactRequestNotificationComponent);