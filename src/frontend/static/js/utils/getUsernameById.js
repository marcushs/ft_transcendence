import {sendRequest} from "./sendRequest.js";

export default async function getUsernameById(id) {
	console.log('id = ', id);
	console.log('uri = ', encodeURIComponent(id))
	const url = `/api/user/get_username_by_id/?q=${id}`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.username;
	} catch (error) {
		console.error(error);
		return null;
	}
}