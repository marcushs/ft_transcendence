import './Enabler2FaComponent.js'

export default () => {
    const html = `
        <div class="twofactor-enable-container">
            <two-factor-enabler-component></two-factor-enabler-component>
        </div>
        `;
    return html;
}

// class twoFactorEnableDone {

// 	constructor() {
// 		this.redirectState = "enable-twofactor-done";
// 		this.class = "enable-twofactor-done";
// 	}

// 	render() {
		// return `
        // <div class="twofactor-enable-done-container">
        //     <h2>Enable Two-Factor Authentication</h2>
        //     <p>You have successfully set up two-factor authentication!</p>
        //     <button id="nextButton">Go back to profile</button>
        // </div>
        // `
// 	}
// }

// export default twoFactorEnableDone;