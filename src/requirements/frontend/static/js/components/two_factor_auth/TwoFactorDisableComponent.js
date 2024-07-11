import { getCookie } from "../../utils/cookie.js";
import { handleRedirection } from "../../utils/handleRedirection.js";

class TwoFactorDisableComponent extends HTMLElement {
    constructor() {
        super();

        this.initialize();
        this.getTwoFactorCode();
        this.attachEventListener();
    }

    async initialize() {
        this.innerHTML = `
            <h1>Disable 2FA Confirmation</h1>
            <p>
            ⚠️ You are about to disable Two-Factor Authentication (2FA). This action is not recommended as it will reduce the security of your account. ⚠️
            </p>
            <p>Are you sure you want to proceed?</p>
            <p id="twofactor-method"></p>
            <input type="text" id="twofactor-code-input" placeholder="Enter 2FA code">
            <button id="confirm-disable-twofactor">Confirm</button>
            <button id="cancel-disable-twofactor">Cancel</button>
        `
    }

    async getTwoFactorCode() {
        const config = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include', // Needed for send cookie
        };
        try {
            const res = await fetch(`http://localhost:8000/account/twofactor/get_2fa_code/`, config);
            if (res.status === 403)
                throw new Error('Access Denied')
            const data = await res.json();
            if (res.status !== 200)
                throw new Error(data.message);
            else {
                const innerSelectedMethod = document.querySelector("#twofactor-method");
                innerSelectedMethod.innerHTML = `To confirm deactivation, please enter the code you received via your 2FA method (${data.method})`
                console.log(`Message: successfully send code by ${data.method}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    async attachEventListener() {
        const confirmButton = document.querySelector('#confirm-disable-twofactor')
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                const enteredCode = document.querySelector('#twofactor-code-input').value;
                if (enteredCode)
                    this.disableTwoFactor(enteredCode);
                else
                    alert('Please enter the 2FA code.');
            })
        }
        const cancelButton = document.querySelector('#cancel-disable-twofactor')
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                const app = document.querySelector('#app');
                
                if (app) {
                    app.innerHTML = '';
                    history.pushState("", "", "/profile");
                    app.innerHTML = profile();
                }
            })
        }
    }

    async disableTwoFactor(verificationCode) {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include', // Needed for send cookie
            body: JSON.stringify({
                code: verificationCode,
            })
        };
        try {
            const res = await fetch(`http://localhost:8000/account/twofactor/disable/`, config);
            if (res.status === 403)
                throw new Error('Access Denied')
            const data = await res.json();
            if (res.status === 200) {
                alert(`${data.message}`);
                handleRedirection('profile');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}

customElements.define("two-factor-disable-component", TwoFactorDisableComponent);