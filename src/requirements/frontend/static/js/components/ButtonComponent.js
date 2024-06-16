class ButtonComponent extends HTMLElement {
	static get observedAttributes() {
		return ['disabled', 'label', 'class'];
	}

	constructor() {
		super();

		this.innerHTML = `
			<div class="button-background">
				<button>${this.getAttribute('label')}</button>
			</div>
		`;
		this.button = this.querySelector('button');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'disabled') {
			if (newValue !== null) {
				this.button.setAttribute('disabled', '');
			} else {
				this.button.removeAttribute('disabled');
			}
		} else if (name === 'label') {
			this.button.textContent = newValue;
		} else if (name === 'class') {
			this.button.className = newValue;
		}
	}

}

customElements.define('button-component', ButtonComponent);