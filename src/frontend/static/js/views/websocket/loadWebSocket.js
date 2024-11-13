
import {removeContactFromList, addNewContactToList, UpdateContactInList} from './updateContactWebsocket.js'
import { receiveChatgroupUpdate, fetchChatroomsList, joinAllInvitedChatrooms, addNewContactToContactedList, removeChatContactFromDOM} from '../../utils/chatUtils/joinRoomUtils.js';
import { updateCurrentChatroomId, messageReceptionDOMUpdate } from '../../utils/chatUtils/sendPrivateMessage.js';
import { UpdateChatContactWebsocket } from './updateChatContactWebsocket.js';
import { UpdateChatroomTopBarWebsocket } from './updateChatroomTopBarWebsocket.js';
import { putNewTournamentToDOM, redirectToTournamentWaitingRoom, updateTournamentInfo, redirectToTournamentHome } from '../../utils/tournamentUtils/joinTournamentUtils.js';
import { redirectToTournamentMatch, startTournamentMatchInstance } from '../../utils/tournamentUtils/tournamentMatchUtils.js';


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
	
    contactSocket = new WebSocket(`wss://localhost:3000/ws/contacts/`);

    contactSocket.onopen = function(event) {
		console.log('Contact websocket started');
	};

    contactSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        const contactMenuComponent = document.querySelector('contact-menu-component')
        if (!contactMenuComponent)
            return;
        if (data.type === 'deleted contact' || data.type === 'deleted contact request') {
            removeContactFromList(data.contact, data.type);
        } else if (data.type === 'contact_update') {
			UpdateContactInList(data.contact, data.change_info, data.old_value);
			UpdateChatContactWebsocket(data.contact, data.change_info, data.old_value);
			UpdateChatroomTopBarWebsocket(data.contact, data.change_info, data.old_value);
		} else {
            addNewContactToList(data.contact, data.type, data.is_sender);
        }
    };

    contactSocket.onclose = function(event) {
		console.log('Contact socket closed');
	};

    contactSocket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//--------------> NOTIFICATION WEBSOCKET <--------------\\

function loadNotificationsWebSocket() {
	notificationSocket = new WebSocket(`wss://localhost:3000/ws/notifications/`);

		notificationSocket.onopen = function(event) {
		    console.log('Notifications websocket started');
        };

		notificationSocket.onmessage = function(event) {
			const data = JSON.parse(event.data);

			if (data.type === 'new_notification')
				throwNewNotificationEvent(data.notification);
			else if (data.type === 'change_notification_sender')
				throwChangeNotificationSenderEvent(data.notification);
			else if (data.type === 'delete_notification')
				throwDeleteNotificationElementEvent(data.notification);
		};

		notificationSocket.onclose = function(event) {
		    console.log('Notifications socket closed');
        };

		notificationSocket.onerror = function(event) {
		    console.error("Websocket error: ", event);
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

//--------------> CHAT WEBSOCKET <--------------\\

function loadChatWebSocket() {
	chatSocket = new WebSocket('wss://localhost:3000/ws/chat/');

	chatSocket.onopen = async function (e) {
		console.log("Chat websocket started");

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
		}
	};

	chatSocket.onclose = function(e) {
		console.log('chatSocket', e);
	};
}

function loadTournamentWebSocket() {
	tournamentSocket = new WebSocket('wss://localhost:3000/ws/tournament/');

	tournamentSocket.onopen = function (e) {
		console.log("The tournament websocket connection was setup successfully !");
	};

	tournamentSocket.onmessage = async function(e) {
		const data = JSON.parse(e.data)
		console.log(data)

		if (data.type === 'create_tournament' && data.status === 'success') {
			redirectToTournamentWaitingRoom(data.tournament);
		} else if (data.type === 'create_tournament' && data.status === 'error') {
			// implement error message in frontend
			console.log(data.message)
		} else if (data.type === 'new_tournament') {
			putNewTournamentToDOM(data.tournament);
		} else if (data.type === 'join_tournament' && data.status === 'error') {
			// implement error message in frontend
			console.log(data.message)
		} else if (data.type === 'redirect_to_waiting_room') {
			redirectToTournamentWaitingRoom(data.tournament);
		} else if (data.type === 'join_tournament') {
			updateTournamentInfo(data.tournament);
		} else if (data.type === 'load_match') {
			console.log('loading tournament match...');
			redirectToTournamentMatch(data.tournament_bracket);
		} else if (data.type === 'redirect_to_tournament_home') {
			redirectToTournamentHome()
		} else if (data.type === 'leave_tournament') {
			updateTournamentInfo(data.tournament);
		} else if (data.type === 'countdown_update') {
			const tournamentMatch = document.querySelector('tournament-match');

			if (!tournamentMatch) return;
			tournamentMatch.updateCountdownSeconds(data.time);
		} else if (data.type === 'start_game_instance') {
			await startTournamentMatchInstance(data.payload);
		}
	};

	tournamentSocket.onclose = function(e) {
		console.log(e);
	};
}
