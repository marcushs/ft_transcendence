import { sendRequest } from "../sendRequest.js";
import { chatSocket, chatroomsList } from "../../views/websocket/loadWebSocket.js";
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
	let res = await sendRequest('GET', '/api/chat/get_chatrooms/', null, false);
	
	return res.chatrooms;
}

export async function updateChatContactListDOM() {
	let contactCount = chatroomsList.length;

	if (contactCount === 0) return ;
	
	const userId = await getUserId();
	const contactedListUl = document.querySelector('.contacted-list > ul');
	const chatContactCountEl = document.getElementById('chat-contact-count');

	chatContactCountEl.innerText = `(${contactCount})`;
	// contactedListUl.innerHTML = '';
	const listItems = document.querySelectorAll('chat-contact-component')
	const contacts = Array.from(listItems)

	chatroomsList.forEach(chatroom => { 
		console.log('userId: ', userId, 'chatroom.members[0].id: ', chatroom.members[0].id, 'chatroom.members[1].id: ', chatroom.members[1].id)
		let user_data = userId === chatroom.members[0].id ? JSON.stringify(chatroom.members[1]) : JSON.stringify(chatroom.members[0]);

		const listElem = document.createElement('li');
		const contactComp = document.createElement('chat-contact-component');

		contactComp.setAttribute('data-user', user_data);
		contactComp.setAttribute('data-chatroom', chatroom.id);
		listElem.appendChild(contactComp);
		contactedListUl.appendChild(listElem);
	});
}

export async function getUserId() {
	let res = await sendRequest('GET', '/api/user/user_info/', null, false);

	if (res.status === 'error') {
		console.log('Cannot get userId: ', res.message);
		return null;
	}
	
	return res.user.id;
}

export async function addNewContactToContactedList(chatroomId) {
	try {
		const userId = await getUserId();
		let res = await sendRequest('GET', `/api/chat/get_chatroom_info/?chatroom_id=${chatroomId}`, null, false);
		const chatroom = res.chatroom_dict; 

		let user_data = userId === chatroom.members[0].id ? chatroom.members[1] : chatroom.members[0];
		const chatContactList = document.querySelector('chat-contact-list');
		const contactedListUl = document.querySelector('.contacted-list > ul');
		if (document.querySelector('.no-contact-text')) document.querySelector('.no-contact-text').remove();
		const listElem = document.createElement('li');
		const contactComp = new ChatContactComponent(user_data, chatroomId);

		console.log(contactComp);
		contactComp.setAttribute('data-chatroom', chatroom.id);
		listElem.appendChild(contactComp);
		contactedListUl.appendChild(listElem);
		chatContactList.addOneToCount();
	} catch (error) {
		
	}
}
