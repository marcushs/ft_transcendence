import index from '../../../views/index.js'
import { getCookie } from "../../../utils/cookie.js";

class twoFactorEnableHome {

	constructor() {
		this.redirectState = "enable-twofactor-home";
		this.class = "enable-twofactor-home";
	}

	render() {
		return `
            <div class="twofactor-enable-home-container">
                <h2>Enable Two-Factor Authentication</h2>
                <p>You are about to take your account security to the next level.</p>
                <p>Follow the steps in this wizard to enable two-factor authentication.</p>
                <button id='back-button' state-redirect>Go back to profile</button>
                <button id='next-button'state-redirect twofactor-method-choice>Next</button>
            </div>
        `
	}   

    async isConnectedUser() { 
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
            const res = await fetch('http://localhost:8001/auth/twofactor/status/', config);
            const data = await res.json();
            if (res.status !== 200) {
                throw new Error('you cant access this page, please login to your account')
            } else {
                if (data.is_verified === true)
                    throw new Error('you cant access this page, you have already setup two factor authentication on your account')
            }
        } catch (error) {
            alert(error.message);
            if (app) {
                app.innerHTML = '';
                history.pushState("", "", "/");
                app.innerHTML = index();
            }
        }
    }
}

export default twoFactorEnableHome;