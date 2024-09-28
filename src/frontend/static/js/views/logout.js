import { getCookie } from "../utils/cookie.js";
import "../components/NavBarComponent.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js"
import { sendRequest } from "../utils/sendRequest.js";

export default () => {
    // const status = checkStatus();
    // console.log('status: ', status)
    const html = `
            <nav-bar auth="true"></nav-bar>
            <div class="container">
                <p>Are you sure you want to logout?</p>
                <button type="button" id="yesBtn">Yes</button>
                <button type="button" id="cancelBtn">Cancel</button>
            </div>
        `;

    setTimeout(() => {
		attachEvent(200);   
	}, 0);

    return html;
}

function attachEvent(status) {
    if (status !== 200)
        return ;

    const yesBtn = document.getElementById('yesBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    cancelBtn.addEventListener('click', () => {
       window.location.replace('profile'); 
    });

    yesBtn.addEventListener('click', async () => {
        try {
            const data = await sendRequest('POST', 'http://localhost:8001/auth/logout/', null);
            console.log(data.message);
            throwRedirectionEvent('login');
        } catch (error) {
            console.log(`${error}`);
        }
    });
}