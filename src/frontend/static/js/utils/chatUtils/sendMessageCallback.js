import ChatRoomTopBar from '../../components/Chat/ChatRoomTopBar.js';
import ChatRoomBottomBar from '../../components/Chat/ChatRoomBottomBar.js';
import ChatRoomConversation from '../../components/Chat/ChatRoomConversation.js';
import { sendRequest } from "../sendRequest.js";
import { sendPrivateMessage } from './sendPrivateMessage.js';

export async function sendMessageCallback(targetUserData) {
	displayChatroomComponent(targetUserData);
};

export async function displayChatroomComponent(targetUserData) {
	const userData = JSON.stringify(targetUserData);
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');
	
	toggleContactMenuToChatMainMenu(chatMainMenu, contactMenu, chatRoom, chatLobby);
	displayChatroomLayout(userData);
	addEventListenersToTopBar(chatMainMenu, contactMenu, chatRoom, chatLobby);
	addEventListenersToMessageInput();
}

function toggleContactMenuToChatMainMenu(chatMainMenu, contactMenu, chatRoom, chatLobby) {
	chatMainMenu.style.display = 'block';
	contactMenu.style.display = 'none';
	chatRoom.classList.add('active');
	chatLobby.classList.remove('active');
}

function displayChatroomLayout(userData) {
    const chatRoom = document.querySelector('.chatroom');
    
    // Clear existing content
    chatRoom.innerHTML = '';

	// Create and append chatroom-top-bar
	const chatRoomTopBar = new ChatRoomTopBar()
	chatRoomTopBar.setAttribute('data-user', userData);
	chatRoom.appendChild(chatRoomTopBar);

	// Create and append chatroom-conversation
	const chatRoomConversation = new ChatRoomConversation();
	chatRoomConversation.setAttribute('data-user', userData);
	chatRoom.appendChild(chatRoomConversation);
	
	// Create and append chatroom-bottom-bar
	const chatRoomBottomBar = new ChatRoomBottomBar();
	chatRoom.appendChild(chatRoomBottomBar);
}

function addEventListenersToTopBar(chatMainMenu, contactMenu, chatRoom, chatLobby) {
	const topBar = document.querySelector('chatroom-top-bar');

	topBar.addEventListener('click', (e) => {
		if (e.target.id === 'chatroom-back-btn') {
			chatMainMenu.style.display = 'none';
			contactMenu.style.display = 'block';
			chatRoom.innerHTML = '';
			chatLobby.classList.add('active');
		}
	});
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
