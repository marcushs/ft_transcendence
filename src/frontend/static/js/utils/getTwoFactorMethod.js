import { getCookie } from "./cookie.js";
import {sendRequest} from "./sendRequest.js";

export async function getTwoFactorMethod() {
	const url = `http://localhost:8002/twofactor/status/`;

	try {
		const data = await sendRequest('GET', url, null);

		return data.method;
	} catch (error) {
		console.error(error);
	}
}