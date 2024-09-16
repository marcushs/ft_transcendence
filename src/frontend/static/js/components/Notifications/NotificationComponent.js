import {sendRequest} from "../../utils/sendRequest.js";
import './AcceptedContactRequestNotificationComponent.js';
import './PendingContactRequestNotificationComponent.js';
import './PrivateMatchInvitationNotificationComponent.js';
import './TournamentMatchInvitationNotificationComponent.js';

class NotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.notifications = [];
		this.unreadNotifications = [];
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
		this.setUnreadNotifications();
		this.setNumberOfNotifications();
		this.fillNotifications();
		this.attachEventsListener();
	}


	attachEventsListener() {
		this.querySelector('.bell').addEventListener('click', () => this.handleClickOnBell());

		this.querySelector('.notifications-container-background').addEventListener('animationend', event => this.handleCloseNotificationsContainerAnimationEnd(event));

		document.addEventListener('closeNotificationsContainer', () => this.closeNotificationsComponent());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.handleClickOutOfComponent());

		document.addEventListener('newNotification', (event) => this.handleNewNotificationEvent(event))
		document.addEventListener('deleteNotificationEvent', (event) => this.handleDeleteNotificationEvent(event))
	}


	// Fill containers

	setNumberOfNotifications() {
		const numberOfNotificationsElement = this.querySelector('.number-of-notifications');

		if (this.unreadNotifications.length > 9) {
			numberOfNotificationsElement.textContent = '9+';
			numberOfNotificationsElement.style.letterSpacing = '-3px';
			numberOfNotificationsElement.style.background = '#ff3030';
		} else if (this.unreadNotifications.length > 0) {
			numberOfNotificationsElement.textContent = this.unreadNotifications.length.toString();
			numberOfNotificationsElement.style.background = '#ff3030';
		} else {
			numberOfNotificationsElement.textContent = this.unreadNotifications.length.toString();
			numberOfNotificationsElement.style.background = '#444';
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
		const li = document.createElement('pending-contact-request-notification-component');

		li.setAttribute('notificationObj', JSON.stringify(notification));
		this.notificationsUlElement.appendChild(li);
	}


	createAcceptedFriendRequestNotification(notification) {
		const li = document.createElement('accepted-contact-request-notification-component');

		li.setAttribute('notificationObj', JSON.stringify(notification));
		this.notificationsUlElement.appendChild(li);
	}


	createPrivateMatchInvitationNotification(notification) {
		const li = document.createElement('li');

		if (notification.is_read)
			li.className = 'unread-notification';

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
			li.className = 'unread-notification';

		li.innerHTML = `
			<p>${notification.receiver} has invited you to join a tournament.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
			<hr>
		`;
		this.notificationsUlElement.append(li);
	}


	// Handle events


	getDuplicateNotificationMessage(notificationsUlElements) {
		const notificationsSet = new Set();

		for (const notificationElement of notificationsUlElements) {
			const paragraph = notificationElement.firstElementChild;

			if (notificationsSet.has(paragraph.innerHTML))
				return paragraph.innerHTML;
			notificationsSet.add(paragraph.innerHTML);
		}
	}

	deleteDuplicateNotificationElement(oldNotificationsUlElements) {
		const newNotificationsUlElements = this.notificationsUlElement.querySelectorAll('li');
		const duplicateMessage = this.getDuplicateNotificationMessage(newNotificationsUlElements);

		for (const notificationElement of oldNotificationsUlElements) {
			const message = notificationElement.firstElementChild.innerHTML;

			if (message === duplicateMessage)
				this.querySelector('ul').removeChild(notificationElement.parentElement);
		}
	}

	handleNewNotificationEvent(event) {
		const notification = event.detail.notification;
		const notificationsUlElements = this.notificationsUlElement.querySelectorAll('li');
		this.notifications.push(notification);

		this.setUnreadNotifications();
		this.changeNumberOfNotifications();

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
		this.deleteDuplicateNotificationElement(notificationsUlElements);
	}


	handleDeleteNotificationEvent(event) {
		this.notifications.forEach((notification) => {
			if (notification.uuid === event.detail.uuid) {
				this.notifications.splice(this.notifications.indexOf(notification), 1);
			}
		})
	}


	handleClickOnBell() {
		if (this.isOpen) {
			this.closeNotificationsComponent();
		} else {
			this.closeOtherNavBarComponent();
			if (this.notifications.length > 0) {
				this.openNotificationsComponent();
				this.querySelector('.notifications-container-background').style.display = 'block';
			}
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

	async openNotificationsComponent() {
		const notificationsMenu = this.querySelector('.notifications-container-background');
		const animationSpeed = (this.notifications.length > 1) ? 0.3 : 0.7;

		notificationsMenu.style.display = 'block';
		notificationsMenu.style.animation = `increaseNotificationsContainerBackgroundHeight ${animationSpeed}s ease forwards`;
		notificationsMenu.querySelector('ul').style.animation = `increaseNotificationsContainerListHeight ${animationSpeed}s ease forwards`;
		this.style.zIndex = '3';
		this.isOpen = !this.isOpen;
		await this.changeIsReadStatus();
		this.changeNumberOfNotifications();
	}


	async closeNotificationsComponent() {
		const notificationsMenu = this.querySelector('.notifications-container-background');

		notificationsMenu.style.animation = 'decreaseNotificationsContainerBackgroundHeight 0.3s ease forwards';
		notificationsMenu.querySelector('ul').style.animation = 'decreaseNotificationsContainerListHeight 0.3s ease forwards';
		this.style.zIndex = '2';
		this.isOpen = !this.isOpen;
		await this.changeIsReadStatus();
		this.changeNumberOfNotifications();
		setTimeout(() => {
			this.changeNotificationsStyle();
		}, 300)
	}


	closeOtherNavBarComponent() {
		const languageMenu = document.querySelector('.language-list');
		const accountInfosMenu = document.querySelector('.account-menu-background');

		if (getComputedStyle(languageMenu).display !== 'none')
			this.throwCloseChooseLanguageComponentEvent();
		if (getComputedStyle(accountInfosMenu).display !== 'none')
			this.throwCloseAccountInfosComponentEvent();
	}


	// Utils

	async getNotificationsFromDb() {
		const url = 'http://localhost:8004/notifications/manage_notifications/';

		try {
			const data = await sendRequest('GET', url, null);

			this.notifications = data.message;
		} catch (error) {
			console.error(error.message);
		}
	}


	setUnreadNotifications() {
		this.unreadNotifications = this.notifications.filter((notification) => notification.is_read === false);
	}


	getNumberOfUnreadNotifications() {
		  const arrWithoutDuplicate = this.unreadNotifications.filter((item, index, self) =>
			  self.findIndex((elem) => (elem.id === item.id )) === index);

		  return arrWithoutDuplicate.length;
	}


	changeNotificationsStyle() {
		const notificationsElements = this.notificationsUlElement.querySelectorAll('li');

		notificationsElements.forEach(notification => {
			if (notification.className !== '')
				notification.className = '';
		})
	}


	async changeIsReadStatus() {
		const uuids = this.unreadNotifications.map((notification) => notification.uuid);

		for (const notification of this.unreadNotifications) {
			await sendRequest('PUT', 'http://localhost:8004/notifications/manage_notifications/', { uuids: uuids });
		}
		this.unreadNotifications = [];
	}


	changeNumberOfNotifications() {
		const numberOfNotifications = this.getNumberOfUnreadNotifications();
		const numberOfNotificationsElement = this.querySelector('.number-of-notifications');
		const numberOfNotificationsElementColor = getComputedStyle(numberOfNotificationsElement).backgroundColor;

		if (numberOfNotifications > 9) {
			numberOfNotificationsElement.textContent = '9+';
			numberOfNotificationsElement.style.letterSpacing = '-3px';
			if (numberOfNotificationsElementColor !== 'rgb(255, 48, 48)')
				numberOfNotificationsElement.style.animation = 'changeNumberOfNotificationsColorToUnread 0.2s linear forwards';
		} else if (numberOfNotifications > 0) {
			numberOfNotificationsElement.textContent = numberOfNotifications.toString();
			if (numberOfNotificationsElementColor !== 'rgb(255, 48, 48)')
				numberOfNotificationsElement.style.animation = 'changeNumberOfNotificationsColorToUnread 0.2s linear forwards';
		} else {
			numberOfNotificationsElement.textContent = numberOfNotifications.toString();
			if (numberOfNotificationsElementColor === 'rgb(255, 48, 48)')
				numberOfNotificationsElement.style.animation = 'changeNumberOfNotificationsColorToRead 0.2s linear forwards';
		}
	}

}

customElements.define('notification-component', NotificationComponent);
