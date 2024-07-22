class PopUpComponent extends HTMLElement {
	static get observedAttributes() {
		return ['image-42-pop-up', 'image-link-pop-up'];
	}

	constructor() {
		super();
		this.initializeComponent();
	}


	initializeComponent() {
		if (this.className === 'image-42-pop-up') {
			this.innerHTML = `
				<div class="pop-up-content">
					
				</div>
			`;
		} else if (this.className === 'image-link-pop-up') {
			this.innerHTML = `
				<div class="pop-up-content">
					<i class="fa-solid fa-xmark"></i>
					<h2>Paste link to an image</h2>
					<input type="url" name="image-link" autofocus>
					<button-component label="Save" class="generic-btn-disabled"></button-component>
				</div>
			`;
		}
	}


	connectedCallback() {
		this.className = this.getAttribute('class');
		this.initializeComponent();
		this.attachEventsListener();
	}


	attachEventsListener() {
		const input = this.querySelector('input');
		const buttonComponent = this.querySelector('button-component');

		this.querySelector('i').addEventListener('click', (event) => this.throwClosePopUpEvent(event));
		document.addEventListener('keydown', (event) => this.throwClosePopUpEvent(event));
		this.querySelector('button-component').addEventListener('click', () => this.throwImageLinkSaved(input));
		input.addEventListener('input', () => this.updateSaveButtonState(input));
	}


	throwClosePopUpEvent(event) {
		if (event && event.type === 'keydown' && event.code !== 'Escape')
			return ;

		document.dispatchEvent(new CustomEvent('closePopUp', {
			bubbles: true
		}));
	}


	throwImageLinkSaved(input) {
		if (input.value !== '') {
			this.dispatchEvent(new CustomEvent('imageLinkSaved', {
				detail: { url: input.value },
				bubbles: true
				// composed: true
			}));
			this.throwClosePopUpEvent();
		}
	}


	updateSaveButtonState(input) {
		console.log('test')
		const saveButton = this.querySelector('button-component');

		if (input.value !== '') {
			saveButton.className = 'generic-btn';
		} else {
			saveButton.className = 'generic-btn-disabled';
		}
	}


}

customElements.define('pop-up-component', PopUpComponent);