import { getCookie } from "../utils/cookie.js";
import index from "./index.js";


export default class LogoutFormHandler {
    constructor(app) {
        this.app = app;
        this.renderForm();
        this.attachEvent();
    }

    renderForm() {
        const container = document.getElementById(this.app);
        if (container) {
            container.innerHTML = /*html*/`
                <div class="container">
                    <form id="logoutForm" method="POST">
                        <p>Are you sure you want to logout?</p>
                        <button type="submit">Yes</button>
                    </form>
                </div>
            `;
        }
    }

    attachEvent() {
        const logoutForm = document.querySelector('#logoutForm');

        if (logoutForm) {
            logoutForm.addEventListener('submit', async (event) => {
                event.preventDefault();
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
                    history.replaceState("", "", "/");
                    document.title = "Index";
                    app.innerHTML = index();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                    // console.error('Network error:', error);
                }
            });
        }
    }
}