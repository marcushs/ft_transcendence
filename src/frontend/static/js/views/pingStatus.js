import { sendRequest } from "../utils/sendRequest.js"

export function sendPingStatus(params) {
    setInterval(async () => {
        const url = 'http://localhost:8000/user/ping_status/';
        console.log('ping sent to back');
        try {
            const data = await sendRequest('POST', url, null);
            console.log('back response: ', data.message);
            
        } catch (error) {
            console.log(error);
        }
    }, 6000)
}