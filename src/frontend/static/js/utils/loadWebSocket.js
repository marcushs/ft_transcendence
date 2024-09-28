import {sendRequest} from "./sendRequest.js";

export async function loadWebSocket() {
	const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);

		socket.onopen = function(event) {};

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

		socket.onclose = function(event) {};

		socket.onerror = function(event) {
		    console.error("Websocket error: ", event);
		};
}

function handleNewMessage(event) {

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

function sendMessage() {

}