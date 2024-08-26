class NotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.notifications = [];
		this.notificationsUlElement = null;
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="bell">
				<p class="number-of-notifications"></p>
				<i class="fa-regular fa-bell"></i>
			</div>
			<div class="notifications-container">
				<ul></ul>
			</div>
		`;
	}


	connectedCallback() {
		// to wait for fetch
		this.notifications[0] = { type: 'friend-request-pending', user: 'Alex', timestamp: '---------' };
		this.notifications[1] = { type: 'friend-request-accepted', user: 'Marcus', timestamp: '---------' };
		this.notifications[2] = { type: 'private-match-invitation', user: 'Shellks', timestamp: '---------' };
		this.notifications[3] = { type: 'tournament-invitation', user: 'Sowoo', timestamp: '---------' };
		// fetch db to get notification

		this.notificationsUlElement = this.querySelector('ul');
		this.fillNumberOfNotifications();
		this.fillNotifications();
		this.attachEventsListener();
	}


	attachEventsListener() {
		this.addEventListener('click', () => {

		});
	}


	fillNumberOfNotifications() {
		const numberOfNotificationsElement = this.querySelector('.number-of-notifications');

		if (this.notifications.length > 9) {
			numberOfNotificationsElement.textContent = '9+';
			numberOfNotificationsElement.style.letterSpacing = '-1px';
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