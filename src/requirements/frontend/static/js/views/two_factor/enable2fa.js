import { getCookie } from "../../utils/cookie.js";

export default class enable2faHandler {
    constructor(app) {
        this.app = app;
        this.renderForm();
        this.attachEvent();
    }

    renderForm() {
        const container = document.getElementById(this.app);
        if (container) {
            container.innerHTML = `
            <div class="container">
            <p>Test</p>
            </div>`;
        }
    }

    async attachEvent() {
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
            const res = await fetch(`http://localhost:8000/account/2fa/enable`, config);
            if (res.status == 403)
                throw new Error('Access Denied')
            const data = await res.json();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}