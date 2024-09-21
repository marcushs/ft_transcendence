import {removeContactFromList, addNewContactToList} from './contactListUtils.js'

export async function loadWebSocket() {
    await loadContactsWebSocket();
    // await loadNotificationWebSocket();
}

async function loadContactsWebSocket() {
    const socket = new WebSocket(`ws://localhost:8003/ws/contacts/`);

    socket.onopen = function(event) {
		console.log('Contact websocket started');
	};

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

        console.log(data.message);
		console.log('data-type: ', data.type);
		console.log('data-sender: ', data.is_sender);
        if (data.type === 'deleted contact') {
            removeContactFromList(data.contact);
        } else {
            const is_request = (data.type === 'new contact request') ? true : false;
            addNewContactToList(data.contact, is_request, data.is_sender);
        }

    };

    socket.onclose = function(event) {
		console.log('test');
	};

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

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