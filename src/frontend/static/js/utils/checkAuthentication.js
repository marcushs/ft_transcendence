import {sendRequest} from "./sendRequest.js";

export default async function checkAuthentication() {
	const url = `/api/user/user_info/`;

	try {
		const data = await sendRequest('GET', url, null);

		if (data.status === 'error')
			return false;
		return true;
	} catch (error) {
        console.error('Error: ' + error);
	}
}
