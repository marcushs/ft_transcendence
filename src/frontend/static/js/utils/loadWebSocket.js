import {sendRequest} from "./sendRequest.js";

// export async function loadWebSocket() {
// 	const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);
//
// 		socket.onopen = function(event) {};
//
// 		socket.onmessage = function(event) {
// 			const data = JSON.parse(event.data);
//
// 			if (data.type === 'new_notification')
// 				throwNewNotificationEvent(data.notification);
// 		};
//
// 		socket.onclose = function(event) {};
//
// 		socket.onerror = function(event) {
// 		    console.error("Websocket error: ", event);
// 		};
// }
//
// function handleNewMessage(event) {
//
// }
//
// function throwNewNotificationEvent(notification) {
// 	const event = new CustomEvent('newNotification', {
// 		bubbles: true,
// 		detail: {
// 			notification: notification
// 		}
// 	});
//
// 	document.dispatchEvent(event);
// }
//
// function throwDeleteNotificationElementEvent(notification) {
// 	const event = new CustomEvent('deleteNotificationElementEvent', {
// 		bubbles: true,
// 		detail: {
// 			notification: notification
// 		}
// 	});
//
// 	document.dispatchEvent(event);
// }
//
// function sendMessage() {
//
// }




export async function loadWebSocket() {
	const socket = new WebSocket(`ws://localhost:8005/ws/game/`);

		socket.onopen = function(event) {
			alert('yest')
		};

		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);

			// if (data.type === 'new_notification')
			// 	throwNewNotificationEvent(data.notification);
		};

		socket.onclose = function(event) {};

		socket.onerror = function(event) {
		    console.error("Websocket error: ", event);
		};
}