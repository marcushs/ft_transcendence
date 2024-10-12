import { sendRequest } from "../sendRequest.js";
import { chatSocket } from "../../views/websocket/loadWebSocket.js";

export async function receiveChatgroupUpdate(data) {
	let res = await sendRequest('GET', '/api/user/get_user_id/', null, false);
	
	if (res.status === 'Error') return console.log(res.message);

	if (res.user_id === data.target_user) {
		const message = {
			'type': 'join_room',
			'chatroom_id': data.chatroom,
		}

		chatSocket.send(JSON.stringify(message));
		console.log(data.target + " joining chatroom id: " + data.chatroom);
	}
}
