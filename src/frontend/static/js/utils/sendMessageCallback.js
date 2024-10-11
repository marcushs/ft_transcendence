import '../components/Chat/ChatRoomTopBar.js';
import { sendRequest } from "./sendRequest.js";
import { chatSocket } from '../views/websocket/loadWebSocket.js';

export async function sendMessageCallback(targetUserData) {
	displayChatroomComponent(targetUserData);
	// await fetchGetOrCreateChatroomView();
	// chatroomWebsocketConnection();
};

function displayChatroomComponent(targetUserData) {
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');
	const ChatRoomTopBar = document.createElement('chatroom-top-bar');
	const oldChatRoomTopBar = chatRoom.querySelector('chatroom-top-bar');
	const sendMessageBtn = document.querySelector('.send-message-btn');

	chatMainMenu.style.display = 'block';
	contactMenu.style.display = 'none';
	chatRoom.classList.add('active');
	chatLobby.classList.remove('active');

	console.log(targetUserData)
	ChatRoomTopBar.setAttribute('data-user', JSON.stringify(targetUserData));
	if (oldChatRoomTopBar) oldChatRoomTopBar.remove();
	chatRoom.prepend(ChatRoomTopBar);

	sendMessageBtn.addEventListener('click', () => {
		sendPrivateMessage();
	})
}

async function fetchGetOrCreateChatroomView() {
	const target_user = document.querySelector('.contact-username').innerText;

	console.log(target_user)
	try {
		let res = await sendRequest('POST', '/api/chat/chat_view/', {'target_user': target_user});
		console.log("Posting user pairs to chat_view for chatroom creatiion" + res.message)
	} catch (error) {
		console.log(error);
	}
}

function sendPrivateMessage() {
	const target_user = document.querySelector('.contact-username').innerText;
	const message = document.querySelector('.chatroom-message-input').value;

	const data = {
		'message': message,
		'target_user': target_user,
		// 'target_user': target_user,
	}
	console.log(data);
	chatSocket.send(JSON.stringify(data));
}
