import {sendRequest} from "./sendRequest.js";

export default async function getUserData() {
	const url = `/api/user/user_info/`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.user;
	} catch (error) {
		console.error(error);
		return null;
	}
}
