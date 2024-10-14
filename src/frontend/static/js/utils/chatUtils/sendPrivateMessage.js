import { chatSocket } from '../../views/websocket/loadWebSocket.js';

export function sendPrivateMessage() {
	const target_user = document.querySelector('.chat-contact-name-status').firstElementChild.innerText;
	const chatroomMessageInput = document.querySelector('.chatroom-message-input');
	const message = chatroomMessageInput.value.trim();

	if (message === '') {
		chatroomMessageInput.value = '';
		chatroomMessageInput.focus();
		return ;
	}

	const data = {
		'type': 'chat_message',
		'message': message,
		'target_user': target_user,
	}
	console.log(data);
	chatSocket.send(JSON.stringify(data));
	chatroomMessageInput.value = '';
}
