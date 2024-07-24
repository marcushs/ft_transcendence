import { getCookie } from "../../../utils/cookie.js";


class twoFactorMethodChoice {

	constructor() {
		this.redirectState = "twofactor-method-choice";
		this.class = "twofactor-method-choice";
	}

	render() {
		return `
        <div class="twofactor-method-choice-container">
            <h2>Enable Two-Factor Authentication</h2>
            <p>Please choose your two-factor authentication method:</p>
            <select id="methodSelect">
                <option value="email">Email</option>
                <option value="authenticator">Authenticator App</option>
            </select>
            <button id='back-button' state-redirect>Back</button>
            <button id='next-button'state-redirect token-verify>Next</button>
        </div>
        `
	}

    getSelectedMethod() {
        const selectedField = document.getElementById('methodSelect');
    
        let selectedMethod = selectedField.value;
        selectedField.addEventListener('change', () => {
            selectedMethod = selectedField.value;
        });
        return selectedMethod;
    }

    async enableTwoFactorRequest(selectedMethod = 'N/A') {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include', // Needed for send cookie
            body: JSON.stringify({
                method: selectedMethod
            })
        };
        const res = await fetch(`http://localhost:8002/twofactor/enable/`, config);
        if (res.status === 403)
           return res.status; 
        const data = await res.json();
        if (res.status === 200) {
            console.log('enable backend response: ', data.message);
            if (data.qrcode) {
                sessionStorage.setItem('qrcodeuri', data.qrcode);
                sessionStorage.setItem('qrcode_token', data.qrcode_token);
                return res.status;
            }
        } else {
            throw new Error(data.message);
        }
    }
}

export default twoFactorMethodChoice;