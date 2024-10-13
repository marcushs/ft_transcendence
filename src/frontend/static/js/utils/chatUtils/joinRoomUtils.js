import { sendRequest } from "../sendRequest.js";
import { chatSocket } from "../../views/websocket/loadWebSocket.js";

export async function receiveChatgroupUpdate(data) {
	let res = await sendRequest('GET', '/api/user/user_info/', null, false);
	
	if (res.status === 'error') return console.log(res.message);

	if (res.user.id === data.target_user) {
		sendJoinRoomMsg(data.chatroom, chatSocket);
		console.log(`${res.user.id} joined ${data.chatroom}`);
	}
}

export function joinAllInvitedChatrooms(chatrooms) {
	console.log('called joinAllInvitedChatrooms')
	chatrooms.forEach(chatroom => {
		console.log('chatroom id is: ' + chatroom.group_id);
		sendJoinRoomMsg(chatroom.group_id, chatSocket);
		console.log('joined chatgroup: ' + chatroom.group_id);
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
