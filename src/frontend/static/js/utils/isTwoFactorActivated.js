import {sendRequest} from "./sendRequest.js";

export async function isTwoFactorActivated() {
    const url = `http://localhost:8002/twofactor/status/`;

    try {
        const data = await sendRequest('GET', url, null);

        return data.is_verified;
    } catch (error) {
        console.error(error);
    }
}