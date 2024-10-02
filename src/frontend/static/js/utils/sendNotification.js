import {sendRequest} from "./sendRequest.js";

export async function sendNotification(receiver, type){
    const url = '/api/notifications/manage_notifications/';
    const payload = {
        receiver: receiver,
        type: type
    };

    try {
        const data = await sendRequest('POST', url, payload);
        if (data.status === 'error')
            console.error(data.message);
    } catch (error) {
        console.error(error.message);
    }
}
