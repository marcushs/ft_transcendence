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

	if (chatUnreadNotif.classList.contains('active')) return;

	chatUnreadNotif.classList.add('active');
}

export function unreadMessageNotifOff() {
	const chatUnreadNotif = document.querySelector('.chat-unread-message-notif');

	if (chatUnreadNotif.classList.contains('active')) chatUnreadNotif.classList.remove('active');
}

export async function messageReceptionDOMUpdate(messageData) {
	updateChatContactComponents(messageData);
	
	const chatroomConversation = document.querySelector('chatroom-conversation');
	
	if (!chatroomConversation) { // need to check if the chatroom conversation is the matching one as well
		unreadMessageNotifOn();
		return ;
	}

	putMessageToChatroomConversation(messageData);
}

function updateChatContactComponents(messageData) {
	const contactedList = document.querySelector('.contacted-list ul');
	const listItems = document.querySelectorAll('chat-contact-component');
	const messagedContacts = Array.from(listItems);
	
	console.log('messagedContacts', messagedContacts);
	messagedContacts.forEach(async (contact) => {
		if (isTargetChatroom(contact.getAttribute('data-chatroom'), messageData.chatroom)) {
			contact.updateLastMessage(messageData.message);
			if (await isSentOrReceivedMessage(messageData.author) === 'received' && !document.querySelector('.chatroom.active')) {
				console.log('here');
				contact.querySelector('.unread-circle').classList.add('active');
			}
		}
	})
	observeUlChanges(contactedList, messageData);
}

function observeUlChanges(element, messageData) {
	const observer = new MutationObserver((mutations) => {
	  mutations.forEach((mutation) => {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach(node => {
				if (node.nodeName === 'LI') {
					const contact = node.querySelector('chat-contact-component');
					if (contact) {
						contact.whenRendered().then(async () => {
							if (await isSentOrReceivedMessage(messageData.author) === 'received' && !document.querySelector('.chatroom.active')) {
								contact.querySelector('.unread-circle').classList.add('active');
							}
						})
					}
				}
			  });
		}
	  });
	});
  
	const config = {
	  childList: true,
	};
  
	observer.observe(element, config);
  
	return observer;
  }

export function checkAllRecentMessagesRead() {
	const listItems = document.querySelectorAll('chat-contact-component');
	const chatContacts = Array.from(listItems);

	chatContacts.forEach(contact => {
		const unreadCircle = contact.querySelector('.unread-circle');

		if (unreadCircle.classList.contains('active')) return false;
	})

	return true;
}
