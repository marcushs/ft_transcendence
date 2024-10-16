import { chatSocket } from '../../views/websocket/loadWebSocket.js';
import { sendRequest } from '../sendRequest.js';
import { getUserId } from './joinRoomUtils.js';
import ChatMessageComponent from "../../components/Chat/ChatMessageComponent.js";

export function sendPrivateMessage() {
	const targetUserData = JSON.parse(document.querySelector('chatroom-top-bar').getAttribute('data-user'));
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
		'target_user': targetUserData.id,
	}
	console.log(data);
	chatSocket.send(JSON.stringify(data));
	chatroomMessageInput.value = '';
}

async function findMatchingChatroom(userId) {
	let res = await sendRequest('GET', `/api/chat/find_matching_chatroom/?targetUserId=${userId}`, null, false);

	if (!res.chatroom_id) return null;

	return res.chatroom_id;
}

export async function updateCurrentChatroomId(userId) {
	const chatroomConversation = document.querySelector('chatroom-conversation');
	const chatroomId = await findMatchingChatroom(userId);

	if (!chatroomId) return ;

	if (chatroomConversation) {
		chatroomConversation.setAttribute('data-chatroom', chatroomId);
	}
}

export async function putMessageToChatroomConversation(messageData) {
	const chatroomConversation = document.querySelector('chatroom-conversation');
	if (!chatroomConversation) return ;
	
	const currentChatroomId = chatroomConversation.getAttribute('data-chatroom');
	if (!isTargetChatroom(currentChatroomId, messageData.chatroom)) return ;
	
	const chatroomConversationUl = chatroomConversation.querySelector('.chatroom-conversation-message-container > ul');
	const liElem = document.createElement('li');
	const messageComponent = new ChatMessageComponent(messageData);

	console.log('putMessageToChatroom: ', messageData);
	const isSent = await isSentOrReceivedMessage(messageData.author);
	console.log(isSent)
 	messageComponent.classList.add(isSent);
	liElem.appendChild(messageComponent);
	chatroomConversationUl.appendChild(liElem);
}

function isTargetChatroom(currentChatroomId, targetChatroomId) {
	return targetChatroomId === currentChatroomId;
}

async function isSentOrReceivedMessage(authorId) {
	const userId = await getUserId();

	console.log('userId is: ', userId)
	console.log('authorId is: ', authorId)
	return userId === authorId ? 'sent' : 'received';
}
