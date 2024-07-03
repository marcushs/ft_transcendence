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
                <button id='back-button' state-redirect>Back</button>
                <button id='next-button'state-redirect twofactor-method-choice>Next</button>
            </div>
        `
	}
}

export default twoFactorEnableHome;