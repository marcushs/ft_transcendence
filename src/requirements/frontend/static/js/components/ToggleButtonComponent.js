import {handleRedirection} from "../utils/handleRedirection.js";

class ToggleButtonComponent extends HTMLElement {
	static get observedAttributes() {
		return ['enabled-action', 'disabled-action'];
	}

	constructor() {
		super();

		this.isEnabled = false;
		this.enabledAction = null;
		this.disabledAction = null;
		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="toggle-button">
				<div class="toggle-circle"></div>
			</div>
		`;
	}


	connectedCallback() {
		this.attachEventListeners();
	}


	attributeChangedCallback(name, oldValue, newValue) {

		if (name === 'enabled-action') {

		} else if (name === 'disabled-action') {

		}
	}


	attachEventListeners() {
		const toggleButton = this.querySelector('.toggle-button');
		const toggleCircle = this.querySelector('.toggle-circle');

		this.addEventListener('click', () => {
			handleRedirection('two-factor');
			// if (!this.isEnabled) {
			// 	this.isEnabled = true;
			// 	toggleButton.style.animation = 'change-color-to-enabled 0.5s ease forwards';
			// 	toggleCircle.style.animation = 'move-circle-to-enabled 0.5s ease forwards';
			// } else {
			// 	this.isEnabled = false;
			// 	toggleButton.style.animation = 'change-color-to-disabled 0.5s ease forwards';
			// 	toggleCircle.style.animation = 'move-circle-to-disabled 0.5s ease forwards';
			// }
		})
	}
}

customElements.define('toggle-button-component', ToggleButtonComponent);