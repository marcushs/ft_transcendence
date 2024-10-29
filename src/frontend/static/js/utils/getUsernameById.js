import {sendRequest} from "./sendRequest.js";

export default async function getUsernameById(id) {
	const url = `http://localhost:8000/user/get_username_by_id/?q=${id}`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.username;
	} catch (error) {
		console.error(error);
		return null;
	}
}