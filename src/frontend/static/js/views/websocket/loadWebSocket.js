import {removeContactFromList, addNewContactToList, UpdateContactInList} from './updateContactWebsocket.js'

let socket = null;

export async function loadWebSocket() {
    await loadContactsWebSocket();
    // await loadNotificationWebSocket();
}

//--------------> CONTACT WEBSOCKET <--------------\\

async function loadContactsWebSocket() {
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
		console.log('contact websocket closed');
	};

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//--------------> NOTIFICATION WEBSOCKET <--------------\\

// async function loadNotificationWebSocket() {
//     const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);

// 		socket.onopen = function(event) {};

// 		socket.onmessage = function(event) {
// 			const data = JSON.parse(event.data);

// 			if (data.type === 'new_notification')
// 				throwNewNotificationEvent(data.notification);
// 		};

// 		socket.onclose = function(event) {};

// 		socket.onerror = function(event) {
// 		    console.error("Websocket error: ", event);
// 		};
// }

// // ------------- Notifications event ------------------ //

// function throwNewNotificationEvent(notification) {
// 	const event = new CustomEvent('newNotification', {
// 		bubbles: true,
// 		detail: {
// 			notification: notification
// 		}
// 	});

// 	document.dispatchEvent(event);
// }

// function throwDeleteNotificationElementEvent(notification) {
// 	const event = new CustomEvent('deleteNotificationElementEvent', {
// 		bubbles: true,
// 		detail: {
// 			notification: notification
// 		}
// 	});

// 	document.dispatchEvent(event);
// }