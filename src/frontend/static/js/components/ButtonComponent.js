import {getString} from "../utils/languageManagement.js";

class ButtonComponent extends HTMLElement {
	static get observedAttributes() {
		return ['disabled', 'label', 'class', 'href', 'icon'];
	}

	constructor() {
		super();

		this.label = null;
		this.class = null;
		this.icon = null;
	}

	connectedCallback() {
		this.icon = this.getAttribute('icon');

		// oauth button with 42 icon
		if (this.icon) {
			this.innerHTML = `
			<div class="button-background">
				<button>
					${this.getAttribute('label')}
					<img src="../../assets/${this.icon}.png" class="${this.icon} ">
				</button>
			</div>
			`;
		} else {
			this.innerHTML = `
				<button>${getString('buttonComponent/' + this.getAttribute('label')) || this.getAttribute('label')}
				</button>
			`;
		}

		this.button = this.querySelector('button');
		if (this.icon) {
			this.style.width = '40%';
			this.button.style.display = 'flex';
			this.button.style.alignItems = 'center';
			this.button.style.justifyContent = 'center';
		}
		this.button.label = this.label;
		this.button.className = this.class;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'label') {
			this.label = newValue;
		} else if (name === 'class') {
			this.class = newValue;
			if (this.button)
				this.button.className = this.class;
		}
	}

}

customElements.define('button-component', ButtonComponent);
