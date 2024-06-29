import { getCookie } from "../../utils/cookie.js";

export async function disableTwoFactor() {
    const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
        },
        credentials: 'include', // Needed for send cookie
    };
    try {
        const res = await fetch(`http://localhost:8000/account/2fa/disable/`, config);
        if (res.status == 403)
            throw new Error('Access Denied')
        const data = await res.json();
        if (data.message) {
            console.log('enable backend response: ', data.message)
            history.replaceState("", "", "/");
            window.location.replace('profile');
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}