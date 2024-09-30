import {sendRequest} from "../../utils/sendRequest.js";
import {sendNotification} from "../../utils/sendNotification.js";
import {convertDateFormat} from "../../utils/convertDateFormat.js";

class PendingContactRequestNotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.notificationObj = null;
	}


	initializeComponent() {
		this.notificationCreateAt = new Date(this.notificationObj.created_at);

		this.innerHTML = `
			<li>			
				<p>You have a new friend request from <span>${this.notificationObj.sender}</span></p>
				<i class="fa-solid fa-check"></i>
				<i class="fa-solid fa-xmark"></i>
				<p class="notification-date">${convertDateFormat(this.notificationCreateAt)}</p>
				<hr>
			</li>
		`;
	}


	connectedCallback() {
		this.notificationObj = JSON.parse(this.getAttribute('notificationObj'));
		this.initializeComponent();
		this.setNotificationClass();
		this.attachEventsListener();
		this.reloadDateEachSeconds();
	}


	attachEventsListener() {
		this.querySelector('.fa-check').addEventListener('click',  event => this.handleClickContactRequest('accept'));
		this.querySelector('.fa-xmark').addEventListener('click',  event => this.handleClickContactRequest('decline'));
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


	throwCloseNotificationsContainerEvent() {
		const event = new CustomEvent('closeNotificationsContainer', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	throwDeleteNotificationEvent() {
		const event = new CustomEvent('deleteNotificationEvent', {
			bubbles: true,
			detail: {
				uuid: this.notificationObj.uuid
			}
		});

		document.dispatchEvent(event);
	}


	async handleClickContactRequest(action) {
		this.notificationObj = JSON.parse(this.getAttribute('notificationObj'));

		const payload = {
	            status: action,
	            target_username: this.notificationObj.sender,
        };

        try {
            const data = await sendRequest('POST', 'http://localhost:8003/friends/manage_friendship/', payload);
            if (data.status === 'success') {
                if (action === 'accept')
                    sendNotification(this.notificationObj.sender, 'friend-request-accepted');

				await sendRequest('DELETE', 'http://localhost:8004/notifications/manage_notifications/', { uuid: this.notificationObj.uuid.replace('notif-', '') });
				this.throwDeleteNotificationEvent();
				this.throwCloseNotificationsContainerEvent();
				this.remove();
            }
        } catch (error) {
            console.error('catch: ', error);
        }
	}

}

customElements.define('pending-contact-request-notification-component', PendingContactRequestNotificationComponent);