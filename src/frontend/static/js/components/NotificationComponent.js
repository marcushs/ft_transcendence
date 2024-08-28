class NotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.notifications = [];
		this.notificationsUlElement = null;
		this.isNotificationsOpen = false;
		this.isChooseLanguageComponentOpen = false;
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


	connectedCallback() {
		// to wait for fetch
		this.notifications[0] = { type: 'friend-request-pending', user: 'Alex', timestamp: '---------'  };
		this.notifications[1] = { type: 'friend-request-accepted', user: 'Marcus', timestamp: '---------' };
		this.notifications[2] = { type: 'private-match-invitation', user: 'Shellks', timestamp: '---------' };
		this.notifications[3] = { type: 'tournament-invitation', user: 'Sowoo', timestamp: '---------' };
		this.notifications[4] = { type: 'tournament-invitation', user: 'Sowoo', timestamp: '---------' };
		// fetch db to get notification

		this.notificationsUlElement = this.querySelector('ul');
		this.fillNumberOfNotifications();
		this.fillNotifications();
		this.attachEventsListener();
	}


	attachEventsListener() {
		this.querySelector('.bell').addEventListener('click', () => this.handleClickOnBell());

		this.querySelector('.notifications-container-background').addEventListener('animationend', event => this.handleCloseNotificationsContainerAnimationEnd(event));

		document.addEventListener('chooseLanguageComponentStateChange', event => this.handleChooseLanguageComponentStateChange(event))

		document.addEventListener('closeNotificationsContainer', () => this.closeNotificationsComponent());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.handleClickOutOfComponent());
	}


	// Handle events

	handleClickOnBell() {
		if (this.isNotificationsOpen) {
			this.closeNotificationsComponent();
		} else {
			if (this.isChooseLanguageComponentOpen)
				this.throwCloseChooseLanguageComponentEvent();
			this.openNotificationsComponent();
			this.querySelector('.notifications-container-background').style.display = 'block';
		}
	}


	handleClickOutOfComponent() {
		if (this.isNotificationsOpen)
			this.closeNotificationsComponent();
	}


	handleChooseLanguageComponentStateChange(event) {
		this.isChooseLanguageComponentOpen = event.detail.isOpen;
	}


	handleCloseNotificationsContainerAnimationEnd(event) {
		if (event.animationName === 'decreaseNotificationsContainerBackgroundHeight')
			this.querySelector('.notifications-container-background').style.display = 'none';
	}


	// Animations

	openNotificationsComponent() {
		this.style.zIndex = '3';
		document.querySelector('choose-language-component').style.zIndex = '2';
		this.querySelector('.notifications-container-background').style.animation = 'increaseNotificationsContainerBackgroundHeight 0.3s ease forwards';
		this.querySelector('.notifications-container-background ul').style.animation = 'increaseNotificationsContainerListHeight 0.3s ease forwards';
		this.throwNotificationsComponentStateEvent(true);
		this.isNotificationsOpen = !this.isNotificationsOpen;
	}


	closeNotificationsComponent() {
		this.querySelector('.notifications-container-background').style.animation = 'decreaseNotificationsContainerBackgroundHeight 0.3s ease forwards';
		this.querySelector('.notifications-container-background ul').style.animation = 'decreaseNotificationsContainerListHeight 0.3s ease forwards';
		this.throwNotificationsComponentStateEvent(false);
		this.isNotificationsOpen = !this.isNotificationsOpen;
	}

	// Throw events

	throwNotificationsComponentStateEvent(isOpen) {
		const event = new CustomEvent('notificationComponentStateChange', {
			bubbles: true,
			detail: {
				isOpen: isOpen
			}
		});

		document.dispatchEvent(event);
	}

	throwCloseChooseLanguageComponentEvent() {
		const event = new CustomEvent('closeChooseLanguageComponent', {
			bubbles: true
		});

		document.dispatchEvent(event);
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

		li.innerHTML = `
			<p>You have a new friend request from ${notification.user}.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
		`;
		this.notificationsUlElement.append(li);
	}


	createAcceptedFriendRequestNotification(notification) {
		const li = document.createElement('li');

		li.innerHTML = `
			<p>${notification.user} has accepted your friend request.</p>
		`;
		this.notificationsUlElement.append(li);
	}


	createPrivateMatchInvitationNotification(notification) {
		const li = document.createElement('li');

		li.innerHTML = `
			<p>${notification.user} has invited you to a private game.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
		`;
		this.notificationsUlElement.append(li);
	}


	createTournamentInvitationNotification(notification) {
		const li = document.createElement('li');

		li.innerHTML = `
			<p>${notification.user} has invited you to join a tournament.</p>
			<i class="fa-solid fa-check"></i>
			<i class="fa-solid fa-xmark"></i>
		`;
		this.notificationsUlElement.append(li);
	}

}

customElements.define('notification-component', NotificationComponent);