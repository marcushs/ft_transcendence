import { sendRequest } from '../../utils/sendRequest.js';
import {removeContactFromList, addNewContactToList, UpdateContactInList} from './updateContactWebsocket.js'
import { receiveChatgroupUpdate, fetchChatroomsList, joinAllInvitedChatrooms, updateChatContactListDOM, addNewContactToContactedList} from '../../utils/chatUtils/joinRoomUtils.js';
import { updateCurrentChatroomId, messageReceptionDOMUpdate } from '../../utils/chatUtils/sendPrivateMessage.js';


let socket = null;

export let chatSocket;
export let chatroomsList;

export async function loadWebSocket() {
    loadContactsWebSocket();
    loadNotificationsWebSocket();
	chatSocket = await loadChatWebSocket();
    // await loadNotificationWebSocket();
}

//--------------> CONTACT WEBSOCKET <--------------\\

function loadContactsWebSocket() {
    if (socket !== null) {
        socket.close();
    }

    socket = new WebSocket(`ws://localhost:8003/ws/contacts/`);

    socket.onopen = function(event) {
		console.log('Contact websocket started');
	};

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        const contactMenuComponent = document.querySelector('contact-menu-component')
        if (!contactMenuComponent)
            return;
        if (data.type === 'deleted contact' || data.type === 'deleted contact request') {
            removeContactFromList(data.contact, data.type);
        } else if (data.type === 'contact_update') {
			UpdateContactInList(data.contact, data.change_info, data.old_value);
		} else {
            addNewContactToList(data.contact, data.type, data.is_sender);
        }
    };

    socket.onclose = function(event) {
		console.log('Contact websocket closed: ', event);
	};

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//--------------> NOTIFICATION WEBSOCKET <--------------\\

function loadNotificationsWebSocket() {
	const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);

		socket.onopen = function(event) {
		    console.log('Notifications websocket started');
        };

		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);

			// console.log(data)
			if (data.type === 'new_notification')
				throwNewNotificationEvent(data.notification);
			else if (data.type === 'change_notification_sender')
				throwChangeNotificationSenderEvent(data.notification);
			else if (data.type === 'delete_notification')
				throwDeleteNotificationElementEvent(data.notification);
		};

		socket.onclose = function(event) {
		    console.log('Notifications websocket closed: ', event);
        };

		socket.onerror = function(event) {
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

async function loadChatWebSocket() {
	const chatSocket = new WebSocket('ws://localhost:8008/ws/chat/');

	chatSocket.onopen = async function (e) {
		console.log("The chat websocket connection was setup successfully !");

		chatroomsList = await fetchChatroomsList();
		joinAllInvitedChatrooms(chatroomsList);
	};
	
	chatSocket.onmessage = async function(e) {
		const data = JSON.parse(e.data);
		
		if (data.type === 'chat_message') {
			await messageReceptionDOMUpdate(data);
		}
		else if (data.type === 'chatgroup_update') {
			await receiveChatgroupUpdate(data);
			// chatroomsList = await fetchChatroomsList();
			await updateCurrentChatroomId(data.target_user);
			await addNewContactToContactedList(data.chatroom);
		}
	};

	chatSocket.onclose = function(e) {
		console.log(e);
	};

	return chatSocket;
}
