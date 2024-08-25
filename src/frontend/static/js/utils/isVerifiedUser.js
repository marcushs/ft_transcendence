import { getCookie } from "./cookie.js";

export async function isTwoFactorActivated() {
    const config = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
        },
        credentials: 'include' // Needed for send cookie
    };
    try {
        const res = await fetch('http://localhost:8002/twofactor/status/', config);
        const data = await res.json();
        if (res.status !== 200) {
            throw new Error('you cant access this page, please login to your account')
        } else {
            console.log('test', data)
            return data.is_verified;
        }
    } catch (error) {
        // alert(error.message);
        // if (app) {
        //     app.innerHTML = '';
        //     history.pushState("", "", "/");
        //     app.innerHTML = index();
        // }
    }
}