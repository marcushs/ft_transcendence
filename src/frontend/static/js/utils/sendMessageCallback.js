import '../components/Chat/ChatRoomTopBar.js';
import { sendRequest } from "./sendRequest.js";

export async function sendMessageCallback(targetUserData) {
	displayChatroomComponent(targetUserData);
	await fetchGetOrCreateChatroomView();
	chatroomWebsocketConnection();
};

function displayChatroomComponent(targetUserData) {
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');
	const ChatRoomTopBar = document.createElement('chatroom-top-bar');
	const oldChatRoomTopBar = chatRoom.querySelector('chatroom-top-bar');

	chatMainMenu.style.display = 'block';
	contactMenu.style.display = 'none';
	chatRoom.classList.add('active');
	chatLobby.classList.remove('active');

	console.log(targetUserData)
	ChatRoomTopBar.setAttribute('data-user', JSON.stringify(targetUserData));
	if (oldChatRoomTopBar) oldChatRoomTopBar.remove();
	chatRoom.prepend(ChatRoomTopBar);
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

function chatroomWebsocketConnection() {
	const chatSocket = new WebSocket(
		'ws://'
		+ 'localhost:8008'
		+ '/ws/chat/'
		// + chatUUID
		+ 'hleung'
		+ '/'
	);


	// const chatRoomTopBar = document.querySelector('chatroom-top-bar');
	// let targetUserData = JSON.parse(chatRoomTopBar.getAttribute('data-user'));
	const sendMessageBtn = document.querySelector('.send-message-btn');
	
	sendMessageBtn.addEventListener('click', ()=> {
		console.log('here	')
		const chatRoomMessageInput = document.querySelector('.chatroom-message-input');
		const message = chatRoomMessageInput.value;
		console.log('input value is:' + message);
		chatSocket.send(JSON.stringify({
			'message': message
		}));
		chatRoomMessageInput.value = '';
	})
}
