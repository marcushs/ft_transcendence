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
            <button id='back-button' state-redirect>Back</button>
            <button id='next-button'state-redirect enable-twofactor-done>Next</button>
        </div>
        `
	}
}

export default twoFactorTokenVerify;