import {removeContactFromList, addNewContactToList, UpdateContactInList} from './updateContactWebsocket.js'
import { receiveChatgroupUpdate, fetchChatroomsList, joinAllInvitedChatrooms, addNewContactToContactedList, removeChatContactFromDOM} from '../../utils/chatUtils/joinRoomUtils.js';
import { updateCurrentChatroomId, messageReceptionDOMUpdate } from '../../utils/chatUtils/sendPrivateMessage.js';
import { UpdateChatContactWebsocket } from './updateChatContactWebsocket.js';
import { UpdateChatroomTopBarWebsocket } from './updateChatroomTopBarWebsocket.js';


export let contactSocket = null;
export let notificationSocket = null;

export let chatSocket;
export let chatroomsList;

export async function loadWebSocket() {
    await loadContactsWebSocket();
    await loadNotificationsWebSocket();
	await loadChatWebSocket();
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

async function loadChatWebSocket() {
	chatSocket = new WebSocket('wss://localhost:3000/ws/chat/');

	chatSocket.onopen = async function (e) {
		console.log("The chat websocket connection was setup successfully !");

		chatroomsList = await fetchChatroomsList();
		joinAllInvitedChatrooms(chatroomsList);
	};

	chatSocket.onmessage = async function(e) {
		const data = JSON.parse(e.data);

		if (data.type === 'chat_message') {
			await messageReceptionDOMUpdate(data);
		} else if (data.type === 'chatgroup_update') {
			await receiveChatgroupUpdate(data);
			// chatroomsList = await fetchChatroomsList();
			await updateCurrentChatroomId(data.target_user);
			await addNewContactToContactedList(data.chatroom);
		} else if (data.type === 'remove_room') {
			removeChatContactFromDOM(data.chatroom);
		}
	};

	chatSocket.onclose = function(e) {
		console.log(e);
	};
}
