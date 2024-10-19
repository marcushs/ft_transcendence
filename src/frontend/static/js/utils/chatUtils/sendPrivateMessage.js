import { chatSocket } from '../../views/websocket/loadWebSocket.js';
import { sendRequest } from '../sendRequest.js';
import { getUserId } from './joinRoomUtils.js';
import ChatMessageComponent from "../../components/Chat/ChatMessageComponent.js";

export function sendPrivateMessage() {
	const targetUserData = JSON.parse(document.querySelector('chatroom-top-bar').getAttribute('data-user'));
	const chatroomMessageInput = document.querySelector('.chatroom-message-input');
	const message = chatroomMessageInput.value.trim();

	if (!isMessageValid(message)) {
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
	if (!chatroomConversation) return ;

	const chatroomId = await findMatchingChatroom(userId);

	if (!chatroomId) return ;

	chatroomConversation.setAttribute('data-chatroom', chatroomId);
}

export async function putMessageToChatroomConversation(messageData) {
	const chatroomConversation = document.querySelector('chatroom-conversation');
	if (!chatroomConversation) {
		unreadMessageNotifOn();
		return ;
	} 
	
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
	chatroomConversation.scrollTop = chatroomConversation.scrollHeight;
}

function isTargetChatroom(currentChatroomId, targetChatroomId) {
	return targetChatroomId === currentChatroomId;
}

export async function isSentOrReceivedMessage(authorId) {
	const userId = await getUserId();

	return userId === authorId ? 'sent' : 'received';
}

function isMessageValid(message) {
	return (message === '' || message.length > 300) ? false : true;
}

function unreadMessageNotifOn() {
	const chatUnreadNotif = document.querySelector('.chat-unread-message-notif');

	chatUnreadNotif.classList.add('active');
}

function unreadMessageNotifOff() {
	const chatUnreadNotif = document.querySelector('.chat-unread-message-notif');

	chatUnreadNotif.classList.remove('active');
}
