import {sendRequest} from "../utils/sendRequest.js";

class NotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.notifications = [];
		this.notificationsUlElement = null;
		this.isOpen = false;
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="bell">
				<p class="number-of-notifications"></p>
				<i class="fa-regular fa-bell"></i>
			</div>
			<div class="notifications-container-background">			
				<div class="notifications-container">
					<ul></ul>
				</div>
			</div>
		`;
	}


	async connectedCallback() {
		await this.getNotificationsFromDb();
		this.notificationsUlElement = this.querySelector('ul');
		this.fillNumberOfNotifications();
		this.fillNotifications();
		this.attachEventsListener();
		await this.deleteNotifications();
		await this.changeIsReadStatus();
	}


	async getNotificationsFromDb() {
		const url = 'http://localhost:8004/notifications/manage_notifications/';

		try {
			const data = await sendRequest('GET', url, null);

			this.notifications = data.message;
		} catch (error) {
			console.error(error.message);
		}
	}

	async deleteNotifications() {
		const notifications = this.notifications.filter((notification) => notification.is_read === true && notification.type === 'friend-request-accepted');

		for (const notification of notifications) {
			console.log(notification)
			await sendRequest('DELETE', 'http://localhost:8004/notifications/manage_notifications/', { uuid: notification.uuid });
		}
	}

	async changeIsReadStatus() {
		const notifications = this.notifications.filter((notification) => notification.is_read === false);
		const uuids = notifications.map((notification) => notification.uuid);

		console.log(uuids)
		for (const notification of notifications) {
			await sendRequest('PUT', 'http://localhost:8004/notifications/manage_notifications/', { uuids: uuids });
		}
	}

	attachEventsListener() {
		this.querySelector('.bell').addEventListener('click', () => this.handleClickOnBell());

		this.querySelector('.notifications-container-background').addEventListener('animationend', event => this.handleCloseNotificationsContainerAnimationEnd(event));

		document.addEventListener('closeNotificationsContainer', () => this.closeNotificationsComponent());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.handleClickOutOfComponent());
	}



	// Fill containers

	fillNumberOfNotifications() {
		const numberOfNotificationsElement = this.querySelector('.number-of-notifications');

		if (this.notifications.length > 9) {
			numberOfNotificationsElement.textContent = '9+';
			numberOfNotificationsElement.style.letterSpacing = '-3px';
		} else {
			numberOfNotificationsElement.textContent = this.notifications.length.toString();
		}
	}


	fillNotifications() {
		this.notifications.forEach((notification) => {
			switch (notification.type) {
				case 'friend-request-pending':
					this.createPendingFriendRequestNotification(notification);
					break ;
				case 'friend-request-accepted':
					this.createAcceptedFriendRequestNotification(notification);
					break ;
				case 'private-match-invitation':
					this.createPrivateMatchInvitationNotification(notification);
					break ;
				case 'tournament-invitation':
					this.createTournamentInvitationNotification(notification);
					break ;
			}
		});
	}


	// Create notification element as li

	createPendingFriendRequestNotification(notification) {
		const li = document.createElement('li');

		if (!notification.is_read)
			li.className = 'no-viewed-notification';

		li.innerHTML = `
			<p>${notification.message}</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
			<hr>
		`;
		this.notificationsUlElement.append(li);
	}


	createAcceptedFriendRequestNotification(notification) {
		const li = document.createElement('li');

		if (!notification.is_read) {
			li.className = 'no-viewed-notification';
		}

		li.innerHTML = `
			<p>${notification.message}</p>
			<hr>
		`;
		this.notificationsUlElement.append(li);
	}


	createPrivateMatchInvitationNotification(notification) {
		const li = document.createElement('li');

		if (notification.is_read)
			li.className = 'no-viewed-notification';

		li.innerHTML = `
			<p>${notification.receiver} has invited you to a private game.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
			<hr>
		`;
		this.notificationsUlElement.append(li);
	}


	createTournamentInvitationNotification(notification) {
		const li = document.createElement('li');

		if (notification.is_read)
			li.className = 'no-viewed-notification';

		li.innerHTML = `
			<p>${notification.receiver} has invited you to join a tournament.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
			<hr>
		`;
		this.notificationsUlElement.append(li);
	}


	// Handle events

	handleClickOnBell() {
		if (this.isOpen) {
			this.closeNotificationsComponent();
		} else {
			this.closeOtherNavBarComponent();
			this.openNotificationsComponent();
			this.querySelector('.notifications-container-background').style.display = 'block';
		}
	}


	handleClickOutOfComponent() {
		if (this.isOpen)
			this.closeNotificationsComponent();
	}


	handleCloseNotificationsContainerAnimationEnd(event) {
		if (event.animationName === 'decreaseNotificationsContainerBackgroundHeight')
			this.querySelector('.notifications-container-background').style.display = 'none';
	}


	// Throw events

	throwCloseChooseLanguageComponentEvent() {
		const event = new CustomEvent('closeChooseLanguageComponent', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	throwCloseAccountInfosComponentEvent() {
		const event = new CustomEvent('closeAccountInfosComponent', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}

	// Animations

	openNotificationsComponent() {
		const notificationsMenu = this.querySelector('.notifications-container-background');

		notificationsMenu.style.display = 'block';
		notificationsMenu.style.animation = 'increaseNotificationsContainerBackgroundHeight 0.3s ease forwards';
		notificationsMenu.querySelector('ul').style.animation = 'increaseNotificationsContainerListHeight 0.3s ease forwards';
		this.style.zIndex = '3';
		this.isOpen = !this.isOpen;
	}


	closeNotificationsComponent() {
		const notificationsMenu = this.querySelector('.notifications-container-background');

		console.log(notificationsMenu)
		notificationsMenu.style.animation = 'decreaseNotificationsContainerBackgroundHeight 0.3s ease forwards';
		notificationsMenu.querySelector('ul').style.animation = 'decreaseNotificationsContainerListHeight 0.3s ease forwards';
		this.style.zIndex = '2';
		this.isOpen = !this.isOpen;
	}


	closeOtherNavBarComponent() {
		const languageMenu = document.querySelector('.language-list');
		const accountInfosMenu = document.querySelector('.account-menu-background');

		console.log(accountInfosMenu)
		if (getComputedStyle(languageMenu).display !== 'none')
			this.throwCloseChooseLanguageComponentEvent();
		if (getComputedStyle(accountInfosMenu).display !== 'none')
			this.throwCloseAccountInfosComponentEvent();
	}

}

customElements.define('notification-component', NotificationComponent);
