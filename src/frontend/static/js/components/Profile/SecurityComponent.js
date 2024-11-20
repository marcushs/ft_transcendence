import '../ToggleButtonComponent.js'
import {throwRedirectionEvent} from "../../utils/throwRedirectionEvent.js";
import {getString} from "../../utils/languageManagement.js";
import {sendRequest} from "../../utils/sendRequest.js";

class SecurityComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `
			<div class="two-factor-container">
				<div class="title">
					<p>${getString('profileComponent/twoFactorTitle')}</p>
				</div>
				<p class="information-sentence">${getString('profileComponent/twoFactorInformation')}</p>
				<hr>
				<div class="two-factor-type">
					<p>${getString('profileComponent/twoFactorByEmail')}</p>
					<toggle-button-component enabled-route="/two-factor-email" disabled-route="/two-factor-deactivation"></toggle-button-component>
				</div>
				<hr>
				<div class="two-factor-type">
					<p>${getString('profileComponent/twoFactorByAuthenticator')}</p>
					<toggle-button-component enabled-route="/two-factor-app" disabled-route="/two-factor-deactivation"></toggle-button-component>
				</div>
			</div>
			<span class="feedbackInformation" id="twoFactorFeedback"></span>
		`;
	}


	async connectedCallback() {
		const oauthInfos = await sendRequest("GET", "/api/auth/auth_type/", null);
		// this.initializeComponent();

		this.innerHTML += `
			<div class="change-password-container" style="${!oauthInfos.oauth_log ? '' : 'display: none;'}">
				<div class="title">
					<p>${getString('profileComponent/changePasswordTitle')}</p>
				</div>
				<p class="information-sentence">${getString('profileComponent/changePasswordInformation')}</p>
				<button-component label="change" class="generic-btn"></button-component>
			</div>
			<span class="feedbackInformation" id="passwordFeedback"></span>
		`;

		this.displayFeedbackFromLocalStorage();
		this.attachEventsListener();
	}


	attachEventsListener() {
		const buttonComponent = this.querySelector('button-component');

		buttonComponent.addEventListener('click', () => throwRedirectionEvent('/change-password'));
	}


	displayFeedbackFromLocalStorage() {
		const twoFactorFeedbackElement = this.querySelector('#twoFactorFeedback');
		const passwordFeedbackElement = this.querySelector('#passwordFeedback');
		const twoFactorResponse = localStorage.getItem('twoFactorFeedback');
		const passwordResponse = localStorage.getItem('passwordFeedback');

		if (twoFactorResponse) {
			twoFactorFeedbackElement.innerHTML = twoFactorResponse;
			localStorage.removeItem('twoFactorFeedback');
		}

		if (passwordResponse) {
			passwordFeedbackElement.innerHTML = passwordResponse;
			localStorage.removeItem('passwordFeedback');
		}

	}

}

customElements.define('security-component', SecurityComponent);