class twoFactorTokenVerify {

	constructor() {
		this.redirectState = "token-verify";
		this.class = "token-verify";
	}

	render() {
		return `
        <div class="twofactor-token-verify-container">
            <h2>Enable Two-Factor Authentication</h2>
            <p>enter the code you received below:</p>
            <div id="qrcode">
            </div>
            <form>
				<div class="form-control">
					<input id="otpCode" type="text" name="Verification code" required>
					<label for="otpCode"></label>
				</div>
                </form>
            <button id="otpButton">Submit Code</button>
            <button id="backButton">Back</button>
            <button id="nextButton">Next</button
        </div>
        `
	}
}

export default twoFactorTokenVerify;