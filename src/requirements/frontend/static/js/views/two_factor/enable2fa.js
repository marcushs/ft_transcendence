import { getCookie } from "../../utils/cookie.js";

export default class enable2faHandler {
    constructor(app) {
        this.app = app;
        this.render();
        this.attachEvent();
    }

    render() {
        const container = document.getElementById('app');
        if (container) {
            container.innerHTML = `
            <h1>Enable Two-Factor Authentication</h1>
            <div id="container">
                <p>You are about to take your account security to the next level.</p>
                <p>Follow the steps in this wizard to enable two-factor authentication.</p>
                <button id='cancel' type='button'>Cancel</button>
                <button id='next' type='button'>Next</button>
            </div>`;
        }
    }

    async attachEvent() {
        const cancelButton = document.getElementById('cancel')
        const nextButton = document.getElementById('next')
        cancelButton.addEventListener('click', () => {
            history.replaceState("", "", "/");
            window.location.replace('profile')
        });
        nextButton.addEventListener('click', () => {
            if (!renderNextForm())
                this.render();
            console.log('Next button clicked');
        });

        function renderNextForm() {
            const container = document.getElementById('container');
            if (container) {
                container.innerHTML = `
                <div class="container">
                    <p>Please select which authentication method you would like to use.</p>
                    <p>Method:</p>
                    <form id="selection-form">
                        <input type="radio" id="token" name="token" value="token">
                        <label for="token">Token generator</label>
                        <input type="radio" id="email" name="email" value="email">
                        <label for="email">Email</label>
                    </form>
                    <button id='cancel' type='button'>Cancel</button>
                    <button id='back' type='button'>Back</button>
                    <button id='next' type='button'>Next</button>
                </div>`;
                const cancelButton = document.getElementById('cancel')
                cancelButton.addEventListener('click', () => {
                    history.replaceState("", "", "/");
                    window.location.replace('profile')
                });
                return true;
            }
            return false;
        }
        // const config = {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //         'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
        //     },
        //     credentials: 'include' // Needed for send cookie
        // };
        // try {
        //     const res = await fetch(`http://localhost:8000/account/2fa/enable/`, config);
        //     if (res.status == 403)
        //         throw new Error('Access Denied')
        //     const data = await res.json();
        //     if (data.user)
        //     console.log('enter in enable backend succesfully')
        // } catch (error) {
        //     alert(`Error: ${error.message}`);
        // }
    }
}