import {sendRequest} from "./sendRequest.js";

export default async function getUserId() {
	const url = `http://localhost:8000/user/get_user_id/`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.id;
	} catch (error) {
		console.error(error);
		return null;
	}
}