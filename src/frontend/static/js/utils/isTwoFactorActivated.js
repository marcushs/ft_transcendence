import {sendRequest} from "./sendRequest.js";

export async function isTwoFactorActivated() {
    const url = `/api/twofactor/status/`;

    try {
        const data = await sendRequest('GET', url, null);

        return data.is_verified;
    } catch (error) {
        console.error(error.message);
    }
}
