import {removeContactFromList, addNewContactToList} from './updateContactWebsocket.js'

export async function loadWebSocket() {
    await loadContactsWebSocket();
	await loadUserWebSocket();
    // await loadNotificationWebSocket();
}

//--------------> USER WEBSOCKET <--------------\\

async function loadUserWebSocket() {
    const socket = new WebSocket(`ws://localhost:8000/ws/user/`);

    socket.onopen = function(event) {
		console.log('User websocket started');
	};

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

		console.log('websocket event: ', data);
		
    };

    socket.onclose = function(event) {
		console.log('test');
	};

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//--------------> CONTACT WEBSOCKET <--------------\\

async function loadContactsWebSocket() {
    const socket = new WebSocket(`ws://localhost:8003/ws/contacts/`);

    socket.onopen = function(event) {
		console.log('Contact websocket started');
	};

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

		console.log('data: ', data);
		
        if (data.type === 'deleted contact' || data.type === 'deleted contact request') {
            removeContactFromList(data.contact, data.type);
        } else {
            addNewContactToList(data.contact, data.type, data.is_sender);
        }

    };

    socket.onclose = function(event) {
		console.log('test');
	};

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//--------------> NOTIFICATION WEBSOCKET <--------------\\

async function loadNotificationWebSocket() {
    const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);

		socket.onopen = function(event) {};

		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);

			if (data.type === 'new_notification')
				throwNewNotificationEvent(data.notification);
		};

		socket.onclose = function(event) {};

		socket.onerror = function(event) {
		    console.error("Websocket error: ", event);
		};
}

// ------------- Notifications event ------------------ //

function throwNewNotificationEvent(notification) {
	const event = new CustomEvent('newNotification', {
		bubbles: true,
		detail: {
			notification: notification
		}
	});

	document.dispatchEvent(event);
}

function throwDeleteNotificationElementEvent(notification) {
	const event = new CustomEvent('deleteNotificationElementEvent', {
		bubbles: true,
		detail: {
			notification: notification
		}
	});

	document.dispatchEvent(event);
}