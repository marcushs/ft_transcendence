import { getCookie } from "../../../utils/cookie.js";

export default class twoFactorTokenVerify {

	constructor() {
		this.redirectState = "token-verify";
		this.class = "token-verify";
        this.selectedMethod = "N/A";
	}

	render() {
        let methodSpecificContent = '';
        if (this.selectedMethod === 'authenticator') {
            methodSpecificContent = `
            <p>To start using a token generator,</p>
            <p>please use your smartphone to scan the QR code below. For example, use Google Authenticator.</p>
            <div id="qrcode"></div>
            <p>Alternatively you can use the following secret to setup TOTP in your authenticator or password manager manually.</p>
            <div id="qrcode-token"></div>
            <p>Then, enter the token generated by the app.</p>
            `
        } else {
            methodSpecificContent = `
            <p>To start using email authentication,</p>
            <p>enter the code you received by ${this.selectedMethod} below:</p>
            `
        }
		return `
        <div class="twofactor-token-verify-container">
            <h2>Enable Two-Factor Authentication</h2>
            ${methodSpecificContent}
            <form class="twofactor-form">
					<input id="otpCode" type="text" name="Verification code" required>
					<label for="otpCode"></label>
            </form>
            <button id='back-button' state-redirect>Back</button>
            <button id='next-button'state-redirect enable-twofactor-done>Verify code</button>
        </div>
        `
	}

    displayQRCode() {
        const qrCodeElement = document.getElementById('qrcode');
        const qrCodeTokenElement = document.getElementById('qrcode-token');
        const qrCodeUri = sessionStorage.getItem('qrcodeuri');
        qrCodeTokenElement.innerHTML = 'Secret: ' + sessionStorage.getItem('qrcode_token');
        if (qrCodeUri) {
            new QRCode(qrCodeElement, qrCodeUri);
        }
    }

    setSelectedMethod(selectedMethod) {
        this.selectedMethod = selectedMethod;
    }

    async VerifyTwoFactorRequest() {
        const verificationCode = document.getElementById('otpCode').value
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include', // Needed for send cookie
            body: JSON.stringify({
                twofactor: verificationCode,
                method: this.selectedMethod,
            })
        }
        const res = await fetch(`/api/twofactor/enable/`, config);
        if (res.status === 403)
            throw new Error('Access Denied')
        const data = await res.json();
        if (res.status === 200) {
            console.log('enable backend response: ', data.message)
        } else
            throw new Error(data.message);
    }
}
