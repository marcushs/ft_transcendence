import { handleRedirection } from '../../utils/handleRedirection.js'
import { getCookie } from "../../utils/cookie.js";


export class TwoFactorVerify {
    constructor(userJson) {
        this.userJson = JSON.parse(userJson);
        this.requestJson = null;

        console.log('test = ', this.userJson)
        alert('alrgdsghs')
        this.initRender();
        this.attachEventListener();
    }

    initRender() {
        if (app) {
            app.innerHTML = `
                <nav-bar auth="true"></nav-bar>
                <h1>Verify Two-Factor Authentication</h1>
                <div class="container">
                    <p id="twofactor-method"></p>
                    <input type="text" id="twofactor-code-input" placeholder="Enter 2FA code">
                    <button id="confirm-verify-twofactor">Verify</button>
                    <button id="cancel-verify-twofactor">Cancel</button>
                </div>
            `;
        }
    }

    async attachEventListener() {
        const confirmButton = document.querySelector('#confirm-verify-twofactor');
        const cancelButton = document.querySelector('#cancel-verify-twofactor');

        await this.getTwoFactorCode();
        confirmButton.addEventListener('click', () => {
            const enteredCode = document.querySelector('#twofactor-code-input').value;
            if (enteredCode) {
                this.setRequestJson(enteredCode);
                this.verifyTwoFactor();
            } else {
                alert('Please enter the 2FA code.');
            }
        });

        cancelButton.addEventListener('click', () => {
            handleRedirection('home')
        });
    }

    async getTwoFactorCode() {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include', // Needed for send cookie
            body: JSON.stringify(this.userJson),
        };
        console.log(config)

        try {
            const res = await fetch(`/api/twofactor/get_2fa_code/`, config);
            if (res.status === 403)
                throw new Error('Access Denied')
            const data = await res.json();
            if (res.status !== 200)
                alert(`Error: ${data.message}`);
            else {
                const innerSelectedMethod = document.querySelector("#twofactor-method");
                innerSelectedMethod.innerHTML = `To confirm 2fa verification, please enter the code you received via your 2FA method (${data.method})`
                console.log(`Message: successfully send code by ${data.method}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    setRequestJson(enteredCode) {
        this.requestJson = {
            ...this.userJson,
            twofactor: enteredCode
        };
    }

    async verifyTwoFactor() {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'include',
            body: JSON.stringify(this.requestJson),
        };
        try {
            const res = await fetch('/api/auth/login/', config);
            if (res.status === 403) {
                throw new Error('Access Denied');
            }
            const data = await res.json();
            if (res.status === 200) {
                alert(data.message);
                handleRedirection('profile');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}
