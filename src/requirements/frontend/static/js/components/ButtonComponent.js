class ButtonComponent extends HTMLElement {
	static get observedAttributes() {
		return ['disabled', 'label', 'class', 'href'];
	}

	constructor() {
		super();

		this.label = null;
		this.class = null;
	}

	connectedCallback() {
		this.innerHTML = `
			<div class="button-background">
				<button>${this.getAttribute('label')}</button>
			</div>
		`;

		this.button = this.querySelector('button');
		this.button.label = this.label;
		this.button.className = this.class;
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'label') {
			(this.button) ? this.button.label = newValue : this.label = newValue;
		} else if (name === 'class') {
			(this.button) ? this.button.className = newValue : this.class = newValue;
		} else if (name === 'href') {
			this.addEventListener('click', () => this.redirectUrl(newValue));
		}
	}

	redirectUrl(url) {
		location.href = url;
	}

}

customElements.define('button-component', ButtonComponent);