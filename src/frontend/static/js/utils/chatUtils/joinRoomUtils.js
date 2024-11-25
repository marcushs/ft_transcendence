import { sendRequest } from "../sendRequest.js";
import { chatSocket } from "../../views/websocket/loadWebSocket.js";
import ChatContactComponent from "../../components/Chat/ChatContactComponent.js";

export async function receiveChatgroupUpdate(data) {
	const userId = await getUserId();

	if (userId === data.target_user) {
		sendJoinRoomMsg(data.chatroom, chatSocket, true);
	}
}

export function joinAllInvitedChatrooms(chatrooms) {
	chatrooms.forEach(chatroom => {
		const chatroomId = chatroom.id
		sendJoinRoomMsg(chatroomId, chatSocket, false);
	});
}

export function sendJoinRoomMsg(chatroom, chatSocket, newRoom) {
	const message = {
		'type': `${newRoom ? 'join_new_room' : 'join_old_room'}`,
		'chatroom_id': chatroom,
	}

	chatSocket.send(JSON.stringify(message));
}

export async function fetchChatroomsList() {
	try {
		let res = await sendRequest('GET', '/api/chat/get_chatrooms/', null, false);
		
		return res.chatrooms;
	} catch (error) {
		return null;
	}
	
}

export async function getUserId() {

	try {
		let res = await sendRequest('GET', '/api/user/user_info/', null, false);
		
		return res.user.id;
	} catch (error) {
		return null;
	}
}

export async function addNewContactToContactedList(chatroomId) {
	try {
		const userId = await getUserId();
		let res = await sendRequest('GET', `/api/chat/get_chatroom_info/?chatroom_id=${chatroomId}`, null, false);
		const chatroom = res.chatroom_dict; 

		let user_data;
		if (userId === chatroom.members[0].id) {
			user_data = chatroom.members[1];
		} else if (userId === chatroom.members[1].id) {
			user_data = chatroom.members[0];
		} else {
			return ;
		}
		const chatContactList = document.querySelector('chat-contact-list');
		const contactedListUl = document.querySelector('.contacted-list > ul');
		if (document.querySelector('.no-contact-text')) document.querySelector('.no-contact-text').parentElement.remove();
		const listElem = document.createElement('li');
		const contactComp = new ChatContactComponent(user_data, chatroomId);

		contactComp.setAttribute('data-chatroom', chatroom.id);
		contactComp.setAttribute('data-user', JSON.stringify(user_data));
		listElem.appendChild(contactComp);
		contactedListUl.appendChild(listElem);
		chatContactList.addOneToCount();
	} catch (error) {
		
	}
}

//<------------------------------------- remove chat contact --------------------------------------->\\

export function removeChatContactFromDOM(chatroom) {
	const chatContactList = document.querySelector('chat-contact-list');
	const listItems = chatContactList.querySelectorAll('chat-contact-component');
	const chatContacts = Array.from(listItems);
	
	chatContacts.forEach(contact => {
		if (chatroom === contact.getAttribute('data-chatroom')) {
			contact.remove();
			chatContactList.subtractOneFromCount();
			return ;
		}
	})
}

export async function removeChatroom(userData) {
	const message = {
		'type': 'remove_room',
		'target_user_id': userData.id,
	}

	chatSocket.send(JSON.stringify(message));
}
