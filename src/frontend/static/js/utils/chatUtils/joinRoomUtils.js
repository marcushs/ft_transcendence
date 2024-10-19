import { sendRequest } from "../sendRequest.js";
import { chatSocket, chatroomsList } from "../../views/websocket/loadWebSocket.js";

export async function receiveChatgroupUpdate(data) {
	const userId = await getUserId();
	let res = await sendRequest('GET', '/api/user/user_info/', null, false);
	
	if (res.status === 'error') return console.log(res.message);

	if (userId === data.target_user) {
		sendJoinRoomMsg(data.chatroom, chatSocket, true);
		console.log(`${userId} joined ${data.chatroom}`);
	}
}

export function joinAllInvitedChatrooms(chatrooms) {
	console.log('called joinAllInvitedChatrooms')
	chatrooms.forEach(chatroom => {
		const chatroomId = chatroom.id
		console.log('chatroom id is: ' + chatroomId);
		sendJoinRoomMsg(chatroomId, chatSocket, false);
		console.log('joined chatgroup: ' + chatroomId);
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
	contactedListUl.innerHTML = '';
	console.log(chatroomsList)

	chatroomsList.forEach(chatroom => { 
		console.log('userId: ', userId, 'chatroom.members[0].id: ', chatroom.members[0].id, 'chatroom.members[1].id: ', chatroom.members[1].id)
		let user_data = userId === chatroom.members[0].id ? JSON.stringify(chatroom.members[1]) : JSON.stringify(chatroom.members[0]);

		console.log('------------> ' + user_data);
		const listElem = document.createElement('li');
		const contactComp = document.createElement('chat-contact-component');

		contactComp.setAttribute('data-user', user_data);
		contactComp.setAttribute('data-chatroom', chatroom.id);
		listElem.appendChild(contactComp);
		contactedListUl.appendChild(listElem);
	});
}

async function getUserInfoById(userId) {
	let res = await sendRequest('GET', `/api/user/get_user_by_id/?q=${userId}`, null, false);

	if (res.status === 'error') {
		console.log(res.message);
	} else {
		return res.user_data;
	}
}

export async function getUserId() {
	let res = await sendRequest('GET', '/api/user/user_info/', null, false);

	if (res.status === 'error') {
		console.log('Cannot get userId: ', res.message);
		return null;
	}
	
	return res.user.id;
}
