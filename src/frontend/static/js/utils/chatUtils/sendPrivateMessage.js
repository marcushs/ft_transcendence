import { chatSocket } from '../../views/websocket/loadWebSocket.js';

export function sendPrivateMessage() {
	const target_user = document.querySelector('.contact-username').innerText;
	const message = document.querySelector('.chatroom-message-input').value;

	const data = {
		'type': 'chat_message',
		'message': message,
		'target_user': target_user,
	}
	console.log(data);
	chatSocket.send(JSON.stringify(data));
}
