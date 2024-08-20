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
				<div class="button-background">
					<button>${this.getAttribute('label')}</button>
				</div>
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
