
import {removeContactFromList, addNewContactToList, UpdateContactInList} from './updateContactWebsocket.js'
import { receiveChatgroupUpdate, fetchChatroomsList, joinAllInvitedChatrooms, addNewContactToContactedList, removeChatContactFromDOM} from '../../utils/chatUtils/joinRoomUtils.js';
import { updateCurrentChatroomId, messageReceptionDOMUpdate , putMessageErrorFeedback} from '../../utils/chatUtils/sendPrivateMessage.js';
import { UpdateChatContactWebsocket } from './updateChatContactWebsocket.js';
import { UpdateChatroomTopBarWebsocket } from './updateChatroomTopBarWebsocket.js';
import * as tournamentHandlers from '../../utils/tournamentUtils/tournamentWebsocketHandlers.js';


export let contactSocket = null;
export let notificationSocket = null;

export let chatSocket;
export let chatroomsList;
export let tournamentSocket;



export async function loadWebSocket() {
    await loadContactsWebSocket();
    await loadNotificationsWebSocket();
	loadChatWebSocket();
	await loadTournamentWebSocket();
}


//--------------> CONTACT WEBSOCKET <--------------\\

async function loadContactsWebSocket() {
    if (contactSocket !== null) {
        contactSocket.close();
    }
	
    contactSocket = new WebSocket(`/ws/contacts/`);

    contactSocket.onopen = function(event) { };

    contactSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const contactMenuComponent = document.querySelector('contact-menu-component');

        if (!contactMenuComponent)
            return;
        if (data.type === 'deleted contact' || data.type === 'deleted contact request') {
			throwContactsInfosChangedEvent();
            removeContactFromList(data.contact, data.type);
        } else if (data.type === 'contact_update') {
			throwContactsInfosChangedEvent();
			UpdateContactInList(data.contact, data.change_info, data.old_value);
			UpdateChatContactWebsocket(data.contact, data.change_info, data.old_value);
			UpdateChatroomTopBarWebsocket(data.contact, data.change_info, data.old_value);
		} else {
			throwContactsInfosChangedEvent();
            addNewContactToList(data.contact, data.type, data.is_sender);
        }
    };

    contactSocket.onclose = function(event) { };

    contactSocket.onerror = function(event) {
        console.error(event);
    };
}

//--------------> NOTIFICATION WEBSOCKET <--------------\\

function loadNotificationsWebSocket() {
	notificationSocket = new WebSocket(`/ws/notifications/`);

		notificationSocket.onopen = function(event) { };

		notificationSocket.onmessage = function(event) {
			const data = JSON.parse(event.data);

			if (data.type === 'new_notification')
				throwNewNotificationEvent(data.notification);
			else if (data.type === 'change_notification_sender')
				throwChangeNotificationSenderEvent(data.notification);
			else if (data.type === 'delete_notification')
				throwDeleteNotificationElementEvent(data.notification);
		};

		notificationSocket.onclose = function(event) { };

		notificationSocket.onerror = function(event) {
		    console.error(event);
		};
}

function throwNewNotificationEvent(notification) {
	const event = new CustomEvent('newNotification', {
		bubbles: true,
		detail: {
			notification: notification
		}
	});

	document.dispatchEvent(event);
}


function throwChangeNotificationSenderEvent(notification) {
	const event = new CustomEvent('changeNotificationSender', {
		bubbles: true,
		detail: {
			notification: notification
		}
	});

	document.dispatchEvent(event);
}


function throwDeleteNotificationElementEvent(notification) {
	const event = new CustomEvent('deleteNotificationElement', {
		bubbles: true,
		detail: {
			notification: notification
		}
	});

	document.dispatchEvent(event);
}

function throwContactsInfosChangedEvent(notification) {
	const event = new CustomEvent('contactsInfosChangedEvent', {
		bubbles: true,
	});

	document.dispatchEvent(event);
}

//--------------> CHAT WEBSOCKET <--------------\\

function loadChatWebSocket() {
	chatSocket = new WebSocket('/ws/chat/');

	chatSocket.onopen = async function (e) {
		chatroomsList = await fetchChatroomsList();
		joinAllInvitedChatrooms(chatroomsList);
	};

	chatSocket.onmessage = async function(e) {
		const data = JSON.parse(e.data);

		if (data.type === 'chat_message') {
			await messageReceptionDOMUpdate(data);
		} else if (data.type === 'chatgroup_update') {
			await receiveChatgroupUpdate(data);
			await updateCurrentChatroomId(data.target_user);
			await addNewContactToContactedList(data.chatroom);
		} else if (data.type === 'remove_room') {
			removeChatContactFromDOM(data.chatroom);
		} else if (data.type === 'chat_error') {
			putMessageErrorFeedback(data.message);
		}
	};

	chatSocket.onclose = function(e) { };
}

export function loadTournamentWebSocket() {
	if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
		return;
	}
	tournamentSocket = new WebSocket('/ws/tournament/');

	tournamentSocket.onopen = function (e) { };

	tournamentSocket.onmessage = async function(e) {
		const data = JSON.parse(e.data)

		const messageHandlers = {
			'create_tournament': tournamentHandlers.handleCreateTournament,
			"new_tournament": tournamentHandlers.handleNewTournament,
			"join_tournament": tournamentHandlers.handleJoinTournament,
			"redirect_to_waiting_room": tournamentHandlers.handleRedirectToWaitingRoom,
			"load_match": tournamentHandlers.handleLoadMatch,
			"redirect_to_tournament_home": tournamentHandlers.handleRedirectToTournamentHome,
			"leave_tournament": tournamentHandlers.handleLeaveTournament,
			"countdown_update": tournamentHandlers.handleCountdownUpdate,
			"start_game_instance": tournamentHandlers.handleStartGameInstance,
			"redirect_to_winner_page": tournamentHandlers.handleRedirectToWinnerPage,
			"redirect_to_tournament_lost": tournamentHandlers.handleRedirectToTournamentLost
		};

		const handler = messageHandlers[data.type];
		if (handler) {
			await handler(data);
		} else {
			console.error('Unknown message type: ', data.type);
		}
	};

	tournamentSocket.onclose = function(e) { };
}
