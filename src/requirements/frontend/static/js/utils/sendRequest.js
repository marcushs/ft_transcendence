import { getCookie } from "./cookie.js";

export async function sendRequest(type, url, payload) {
    try {
        isValidInput(type, url, payload)
        const config = setConfigRequest(type, url, payload)
        const res = await fetch(url, config);
        const data = await res.json();
        if (res.status !== 200)
            throw new Error(data.message);
        return data
    } catch (error) {
        console.log('error: ', error);
        throw new Error(error);
    }
}

function setConfigRequest(type, payload=null) {
    const config = {
        method: type,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
        },
        credentials: 'include' // Needed for send cookie
    };
    if (payload)
        config.body = JSON.stringify(payload)
}

function isValidInput(type, url, payload) {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    if (!validMethods.includes(type))
        throw new Error(`Invalid HTTP method: ${type}`);
    if (typeof url !== 'string' || url.trim() === '') {
        throw new Error('Invalid URL');
    }
    if (payload !== null && typeof payload !== 'object') {
        throw new Error('Payload must be an object or null');
    }
}