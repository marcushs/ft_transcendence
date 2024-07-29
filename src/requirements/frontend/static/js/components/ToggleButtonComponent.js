import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getTwoFactorMethod} from "../utils/getTwoFactorMethod.js";

class ToggleButtonComponent extends HTMLElement {
	static get observedAttributes() {
		return ['enabled-route', 'disabled-route', 'is-two-factor-activated'];
	}

	constructor() {
		super();
		this.enabledRoute = null;
		this.disabledRoute = null;
		this.twoFactorMethod = null;
		this.isTwoFactorActivated = localStorage.getItem('isTwoFactorActivated').toLowerCase() === 'true';
		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="toggle-button toggle-button-disabled">
				<div class="toggle-circle"></div>
			</div>
		`;
	}


	async connectedCallback() {
		if (this.isTwoFactorActivated) {
			const twoFactorMethod = localStorage.getItem('twoFactorMethod');
			const toggleButton = this.querySelector('.toggle-button');

			if (this.enabledRoute === '/two-factor-app' && twoFactorMethod === 'authenticator') {
				toggleButton.classList.add('toggle-button-enabled');
				toggleButton.classList.remove('toggle-button-disabled');
			} else if (this.enabledRoute === '/two-factor-email' && twoFactorMethod === 'email') {
				toggleButton.classList.add('toggle-button-enabled');
				toggleButton.classList.remove('toggle-button-disabled');
			}
		}
		(this.enabledRoute.includes('email')) ? this.twoFactorMethod = 'email' : this.twoFactorMethod = 'authenticator';
		this.attachEventListeners();
	}


	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'enabled-route') {
			this.enabledRoute = newValue;
		} else if (name === 'disabled-route') {
			this.disabledRoute = newValue;
		}
	}


	attachEventListeners() {
		const toggleButton = this.querySelector('.toggle-button');
		const toggleCircle = this.querySelector('.toggle-circle');

		this.addEventListener('click', async () => {
			const twoFactorMethod = await getTwoFactorMethod();

			if (this.isTwoFactorActivated && twoFactorMethod !== this.twoFactorMethod)
				localStorage.setItem('changeTwoFactorMethod', 'true');
			else
				localStorage.setItem('changeTwoFactorMethod', 'false');
			if (!this.isTwoFactorActivated) {
				toggleButton.style.animation = 'change-color-to-enabled 0.5s ease forwards';
				toggleCircle.style.animation = 'move-circle-to-enabled 0.5s ease forwards';
				alert('test')
				throwRedirectionEvent(this.enabledRoute);
			} else {
				toggleButton.style.animation = 'change-color-to-disabled 0.5s ease forwards';
				toggleCircle.style.animation = 'move-circle-to-disabled 0.5s ease forwards';
				throwRedirectionEvent(this.disabledRoute);
			}

		})
	}
}

customElements.define('toggle-button-component', ToggleButtonComponent);