import {sendRequest} from "./sendRequest.js";

export default async function getUserId() {
	const url = `/api/user/get_user_id/`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.id;
	} catch (error) {
		return null;
	}
}