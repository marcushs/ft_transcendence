import '../../components/Chat/ChatRoomTopBar.js';
import '../../components/Chat/ChatRoomBottomBar.js';
import { sendRequest } from "../sendRequest.js";
import { sendPrivateMessage } from './sendPrivateMessage.js';

export async function sendMessageCallback(targetUserData) {
	displayChatroomComponent(targetUserData);
};

function displayChatroomComponent(targetUserData) {
	const userData = JSON.stringify(targetUserData);
	
	toggleContactMenuToChatMainMenu();
	displayChatroomLayout(userData);
	addEventListenersToMessageInput();
}

function toggleContactMenuToChatMainMenu() {
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');
	
	chatMainMenu.style.display = 'block';
	contactMenu.style.display = 'none';
	chatRoom.classList.add('active');
	chatLobby.classList.remove('active');
}

function displayChatroomLayout(userData) {
	const chatRoom = document.querySelector('.chatroom');
	const chatRoomTopBar = document.createElement('chatroom-top-bar');
	const oldChatRoomTopBar = chatRoom.querySelector('chatroom-top-bar');

	chatRoomTopBar.setAttribute('data-user', userData);

	if (oldChatRoomTopBar) oldChatRoomTopBar.remove();
	chatRoom.prepend(chatRoomTopBar);

	if (chatRoom.querySelector('chatroom-conversation')) chatRoom.querySelector('chatroom-conversation').remove();
	chatRoom.innerHTML += '<chatroom-conversation></chatroom-conversation>';
	document.querySelector('chatroom-conversation').setAttribute('data-user', userData);
	
	if (chatRoom.querySelector('chatroom-bottom-bar')) chatRoom.querySelector('chatroom-bottom-bar').remove();
	chatRoom.innerHTML += '<chatroom-bottom-bar></chatroom-bottom-bar>';
}

function addEventListenersToMessageInput() {
	const chatroomMessageInput = document.querySelector('.chatroom-message-input');
	const sendMessageBtn = document.querySelector('.send-message-btn');
	
	chatroomMessageInput.focus();
	chatroomMessageInput.addEventListener('keyup', (e) => {
		if (e.keyCode === 13) sendPrivateMessage();
	})
	sendMessageBtn.addEventListener('click', () => {
		sendPrivateMessage();
	})
}
