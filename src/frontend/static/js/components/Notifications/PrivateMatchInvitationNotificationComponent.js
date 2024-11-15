import {sendRequest} from "../../utils/sendRequest.js";
import {sendNotification} from "../../utils/sendNotification.js";
import {convertDateFormat} from "../../utils/convertDateFormat.js";
import {getString} from "../../utils/languageManagement.js";
import {matchmakingSocket, matchmakingWebsocket} from "../../utils/matchmaking/matchmakingWebsocket.js";
import {gameWebsocket} from "../Game/states/inGame/gameWebsocket.js";
import getUserId from "../../utils/getUserId.js";
import {throwRedirectionEvent} from "../../utils/throwRedirectionEvent.js";
import {waitForStatesContainer} from "../../utils/game/gameConnection.js";

class PrivateMatchInvitationNotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.notificationObj = null;
	}


	initializeComponent() {
		this.notificationCreateAt = new Date(this.notificationObj.created_at);

		console.log(this.notificationObj)
		this.innerHTML = `
			<li>			
				<p><span>${this.notificationObj.sender}</span> ${getString('notificationsComponent/privateMatchInvitationSuffix')}</p>
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
		this.querySelector('.fa-check').addEventListener('click',  event => this.handleClickContactRequest('accepted'));
		this.querySelector('.fa-xmark').addEventListener('click',  event => this.handleClickContactRequest('refused'));
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
			sender_username: this.notificationObj.sender,
			choice : action
		};

		try {
			const data = await sendRequest('POST', '/api/matchmaking/manage_private_match/', payload);
			if (data.status === 'success') {
				await sendRequest('DELETE', '/api/notifications/manage_notifications/', { uuid: this.notificationObj.uuid.replace('notif-', '') });
				await matchmakingWebsocket()
				this.throwDeleteNotificationEvent();
				this.throwCloseNotificationsContainerEvent();
				// if (location.href)
				console.log(location.pathname)
				if (location.pathname !== '/') {
					throwRedirectionEvent('/');
				}
				//  await this.waitForStatesContainer();
				// this.throwChangeGameStateEvent();
				// throw
				// await waitForStatesContainer();
				// await this.throwChangeGameStateEvent();
				// } else {
				// 	if (document.querySelector('.states-container')) {
					// }

				setTimeout(async () => {
					await this.waitForPrivateMatchComponent();
					this.throwGuestPrivateMatchEvent();
				})

				// this.remove();
			}
		} catch (error) {
			console.error('catch: ', error);
		}
	}

	async waitForStatesContainer() {
		await new Promise(resolve => {
			const observer = new MutationObserver(() => {
				const newContainer = document.querySelector('#gameStatesContainer');
				if (newContainer) {
					observer.disconnect();
					resolve();
				}
			});
			observer.observe(document.body, { childList: true, subtree: true });
		});
	}

	async waitForPrivateMatchComponent() {
		await new Promise(resolve => {
			const observer = new MutationObserver(() => {
				const newContainer = document.querySelector('private-match-component');
				if (newContainer) {
					observer.disconnect();
					resolve();
				}
			});
			observer.observe(document.body, { childList: true, subtree: true });
		});
	}

	throwChangeGameStateEvent() {
		console.log('states event')
		const event = new CustomEvent('changeGameStateEvent', {
			bubbles: true,
			detail: {
				context: "onlineHome",
			}
		});

		document.dispatchEvent(event);
	}

	throwGuestPrivateMatchEvent() {
		const event = new CustomEvent('guestPrivateMatchEvent', {
			bubbles: true,
			detail: {
				ownerName: this.notificationObj.sender
			}
		});

		document.dispatchEvent(event);
	}

}

customElements.define('private-match-invitation-notification-component', PrivateMatchInvitationNotificationComponent);
