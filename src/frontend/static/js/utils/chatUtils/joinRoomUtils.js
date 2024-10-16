import { sendRequest } from "../sendRequest.js";
import { chatSocket, chatroomsList } from "../../views/websocket/loadWebSocket.js";

let userId;

export async function receiveChatgroupUpdate(data) {
	const userId = await getUserId();
	let res = await sendRequest('GET', '/api/user/user_info/', null, false);
	
	if (res.status === 'error') return console.log(res.message);

	if (userId === data.target_user) {
		sendJoinRoomMsg(data.chatroom, chatSocket);
		console.log(`${userId} joined ${data.chatroom}`);
	}
}

export function joinAllInvitedChatrooms(chatrooms) {
	console.log('called joinAllInvitedChatrooms')
	chatrooms.forEach(chatroom => {
		const chatroomId = chatroom.id
		console.log('chatroom id is: ' + chatroomId);
		sendJoinRoomMsg(chatroomId, chatSocket);
		console.log('joined chatgroup: ' + chatroomId);
	});
}

export function sendJoinRoomMsg(chatroom, chatSocket) {
	const message = {
		'type': 'join_room',
		'chatroom_id': chatroom,
	}
	
	chatSocket.send(JSON.stringify(message));
}

export async function fetchChatroomsList() {
	let res = await sendRequest('GET', '/api/chat/get_chatrooms/', null, false);
	
	return res.chatrooms;
}


export async function updateChatContactListDOM() {
	if (chatroomsList.length === 0) return ;
	
	const userId = await getUserId();
	const contactedList = document.querySelector('.contacted-list > ul');

	contactedList.innerHTML = '';

	chatroomsList.forEach(chatroom => { 
		console.log('userId: ', userId, 'chatroom.members[0].id: ', chatroom.members[0].id, 'chatroom.members[1].id: ', chatroom.members[1].id)
		let user_data = userId === chatroom.members[0].id ? JSON.stringify(chatroom.members[1]) : JSON.stringify(chatroom.members[0]);

		console.log('------------> ' + user_data);
		const listElem = document.createElement('li');
		const contactComp = document.createElement('chat-contact-component');

		contactComp.setAttribute('data-user', user_data);
		listElem.appendChild(contactComp);
		contactedList.appendChild(listElem);
		// console.log('chatroom members: ' + chatroom.user_id);
		// let userData = await getUserInfoById(chatroom.)
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

	
