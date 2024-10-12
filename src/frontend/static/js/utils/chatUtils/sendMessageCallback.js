import '../../components/Chat/ChatRoomTopBar.js';
import '../../components/Chat/ChatRoomBottomBar.js';
import { sendRequest } from "../sendRequest.js";
import { sendPrivateMessage } from './sendPrivateMessage.js';

export async function sendMessageCallback(targetUserData) {
	displayChatroomComponent(targetUserData);
};

function displayChatroomComponent(targetUserData) {
	const chatMainMenu = document.querySelector('.chat-main-menu');
	const contactMenu = document.querySelector('.contact-menu');
	const chatRoom = document.querySelector('.chatroom');
	const chatLobby = document.querySelector('.chat-lobby');
	const chatRoomTopBar = document.createElement('chatroom-top-bar');
	const oldChatRoomTopBar = chatRoom.querySelector('chatroom-top-bar');
	
	chatMainMenu.style.display = 'block';
	contactMenu.style.display = 'none';
	chatRoom.classList.add('active');
	chatLobby.classList.remove('active');
	
	console.log(targetUserData)
	chatRoomTopBar.setAttribute('data-user', JSON.stringify(targetUserData));
	if (oldChatRoomTopBar) oldChatRoomTopBar.remove();
	chatRoom.prepend(chatRoomTopBar);

	if (chatRoom.querySelector('chatroom-bottom-bar')) chatRoom.querySelector('chatroom-bottom-bar').remove();
	
	chatRoom.innerHTML += '<chatroom-bottom-bar></chatroom-bottom-bar>';
	const sendMessageBtn = document.querySelector('.send-message-btn');
	
	sendMessageBtn.addEventListener('click', () => {
		sendPrivateMessage();
	})
}

async function fetchGetOrCreateChatroomView() {
	const target_user = document.querySelector('.chat-contact-name-status').firstChild.innerText;

	console.log(target_user)
	try {
		let res = await sendRequest('POST', '/api/chat/chat_view/', {'target_user': target_user});
		console.log("Posting user pairs to chat_view for chatroom creatiion" + res.message)
	} catch (error) {
		console.log(error);
	}
}
