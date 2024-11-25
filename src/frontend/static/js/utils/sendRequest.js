import { getCookie } from "./cookie.js";

export async function sendRequest(type, url, payload, isFormData=false) {
    try {
        let config;

        isValidInput(type, url, payload);
        if (isFormData === true)
            config = setConfigRequestFormData(type, payload);
        else
            config = setConfigRequest(type, payload);
        const res = await fetch(url, config);
        const data = await res.json();

        if (res.status < 200 || res.status > 299)
            throw new Error(data.message);
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

function  setConfigRequestFormData(type, formData) {
    const config = {
        method: type,
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
        },
        body: formData,
        credentials: 'include' // Needed for send cookie
    };
    return config;
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
    if (payload !== null)
        config.body = JSON.stringify(payload);
    return config;
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