import { getCookie } from "../utils/cookie.js";
import "../components/NavBarComponent.js";

export default () => {
    const html = `
        <nav-bar auth="true"></nav-bar>
        <div class="container">
            <p>Are you sure you want to logout?</p>
            <button type="button" id="yesBtn">Yes</button>
            <button type="button" id="cancelBtn">Cancel</button>
        </div>
    `

    setTimeout(() => {
		attachEvent();   
	}, 0);

    return html;
}

function attachEvent() {
    const yesBtn = document.getElementById('yesBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', () => {
       window.location.replace('profile'); 
    });

    yesBtn.addEventListener('click', async () => {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include' // Needed for send cookie
        };
        try {
            const res = await fetch(`http://localhost:8000/account/logout/`, config);
            if (res.status == 403)
                throw new Error('Access Denied')
            const data = await res.json();
            if (!res.ok) {
                throw new Error(`${res.status} - ${data.error}`);
            }
            alert(data.message)
            window.location.replace('login');
        } catch (error) {
            if (error.data && error.data.status === 'jwt_failed') {
                history.replaceState("", "", "/");
                document.title = "Index";
            }
            alert(`Error: ${error.message}`);
            // console.error('Network error:', error);
        }
    });
}
