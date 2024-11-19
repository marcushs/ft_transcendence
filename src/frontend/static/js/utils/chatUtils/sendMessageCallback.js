import ChatRoomTopBar from '../../components/Chat/ChatRoomTopBar.js';
import ChatRoomBottomBar from '../../components/Chat/ChatRoomBottomBar.js';
import ChatRoomConversation from '../../components/Chat/ChatRoomConversation.js';
import { sendPrivateMessage } from './sendPrivateMessage.js';

export async function sendMessageCallback(targetUserData) {
	await displayChatroomComponent(targetUserData);
};

export async function displayChatroomComponent(targetUserData, fromContact=false) {
	const userData = JSON.stringify(targetUserData);
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');

	toggleContactMenuToChatMainMenu(chatMainMenu, contactMenu, chatRoom, chatLobby);
	displayChatroomLayout(userData);
	addEventListenersToTopBar(chatMainMenu, contactMenu, chatRoom, chatLobby, fromContact);
	addEventListenersToMessageInput();
}

function toggleContactMenuToChatMainMenu(chatMainMenu, contactMenu, chatRoom, chatLobby) {
	if (chatMainMenu)
		chatMainMenu.style.display = 'block';
	if (contactMenu)
		contactMenu.style.display = 'none';
	if (chatRoom)
		chatRoom.classList.add('active');
	if (chatLobby)
		chatLobby.classList.remove('active');
}

function displayChatroomLayout(userData) {
	const chatRoom = document.querySelector('.chatroom');

	if (!chatRoom)
		return;
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
	if (JSON.parse(userData).username === 'Tournament Bot') return;
	const chatRoomBottomBar = new ChatRoomBottomBar();
	chatRoom.appendChild(chatRoomBottomBar);
}

function addEventListenersToTopBar(chatMainMenu, contactMenu, chatRoom, chatLobby, fromContact) {
	const topBar = document.querySelector('chatroom-top-bar');

	if (!topBar)
		return ;

	const handleBackBtnClickFromSendMessage = (e) => {
		if (e.target.id === 'chatroom-back-btn') {
			chatMainMenu.style.display = 'none';
			contactMenu.style.display = 'block';
			chatRoom.innerHTML = '';
			chatLobby.classList.add('active');
		}
	};

	const handleBackBtnClickFromChatContact = (e) => {
		if (e.target.id === 'chatroom-back-btn') {
			chatRoom.innerHTML = '';
			chatLobby.classList.add('active');
		}
	}

	topBar.removeEventListener('click', handleBackBtnClickFromSendMessage)
	topBar.removeEventListener('click', handleBackBtnClickFromChatContact)

	if (fromContact) return topBar.addEventListener('click', handleBackBtnClickFromChatContact);
	topBar.addEventListener('click', handleBackBtnClickFromSendMessage);
}

function addEventListenersToMessageInput() {
	const chatroomMessageInput = document.querySelector('.chatroom-message-input');
	if (!chatroomMessageInput) return;
	const sendMessageBtn = document.querySelector('.send-message-btn');

	chatroomMessageInput.focus();
	chatroomMessageInput.addEventListener('keyup', (e) => {
		if (e.keyCode === 13) sendPrivateMessage();
	});
	sendMessageBtn.addEventListener('click', () => {
		sendPrivateMessage();
	});
}
