import { sendRequest } from "../sendRequest.js";

export async function fetchChatroomsList() {
	let res = await sendRequest('GET', '/api/chat/get_chatrooms/', null, false);
	console.log(res);
}
