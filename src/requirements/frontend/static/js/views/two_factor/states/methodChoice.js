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
}

export default twoFactorMethodChoice;