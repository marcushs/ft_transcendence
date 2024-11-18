class TwoFactorInputComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `
	        <input id="0" type="text" maxlength="1" autocomplete="off" required autofocus>
            <input id="1" type="text" maxlength="1" autocomplete="off" required>
            <input id="2" type="text" maxlength="1" autocomplete="off" required>
            <input id="3" type="text" maxlength="1" autocomplete="off" required>
            <input id="4" type="text" maxlength="1" autocomplete="off" required>
            <input id="5" type="text" maxlength="1" autocomplete="off" required>
		`;
	}


	connectedCallback() {
		this.attachEventListeners();
	}


	attachEventListeners() {
		const inputs = document.querySelectorAll('input');

		inputs.forEach(input => {
			input.addEventListener('paste', event => this.handlePasteOnInput(event, inputs));
		})

		inputs.forEach((input) => {
			input.addEventListener('input', event => this.handleInputEvent(event, inputs));
		});

		inputs.forEach((input) => {
			input.addEventListener('keydown', event => this.handleKeydownEvent(event, inputs));
		});
	}


	handlePasteOnInput(event, inputs) {
		let pastedValue = event.clipboardData.getData('text');
		let inputToFocus;

		inputs.forEach(input => {
			if (input.value === '' && pastedValue !== '') {
				input.value = pastedValue.at(0);
				pastedValue = pastedValue.slice(1, pastedValue.length);
				inputToFocus = input;
			}
		});

		if (inputToFocus)
			inputToFocus.focus();
	}


	handleInputEvent(event, inputs) {
		if (isNaN(event.target.value))
			event.target.value = '';
	}


	handleKeydownEvent(event, inputs) {
		const currentInput = event.target;
		const currentInputIndex = parseInt(currentInput.id);

		if (event.code === 'Backspace')
			this.handleBackspaceKeyPressed(currentInput, currentInputIndex - 1, inputs, event.key);
		else if (event.code.match(/^Digit[0-9]$/) || event.code.match(/^Numpad[0-9]$/))
			this.handleDigitKeyPressed(currentInput, currentInputIndex + 1, inputs, event.key);
		else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight')
			this.handleArrowKeyPressed(currentInputIndex, inputs, event.code);
	}


	handleDigitKeyPressed(currentInput, nextInputIndex, inputs, key) {
		if (currentInput.value === '') {
			currentInput.value = key;
			setTimeout(() => {
				if (inputs[nextInputIndex])
					inputs[nextInputIndex].focus();
			}, 0);
		}
		else {
			if (inputs[nextInputIndex]) {
				inputs[nextInputIndex].focus();
				if (inputs[nextInputIndex] === '')
					inputs[nextInputIndex].value = key;
			}
		}
		setTimeout(() => {
			if (this.isAllInputsFilled())
				this.throwSubmitEvent();
		}, 0);
	}


	handleBackspaceKeyPressed(currentInput, previousInputIndex, inputs, key) {
		if (currentInput.value !== '') {
			currentInput.value = '';
			setTimeout(() => {
				if (inputs[previousInputIndex])
					inputs[previousInputIndex].focus();
			}, 0);
		}
		else {
			if (inputs[previousInputIndex]) {
				inputs[previousInputIndex].value = '';
				inputs[previousInputIndex].focus();
			}
		}
	}


	handleArrowKeyPressed(currentInputIndex, inputs, arrow) {
		if (arrow === 'ArrowLeft') {
			if (inputs[currentInputIndex - 1])
				inputs[currentInputIndex - 1].focus();
		} else if (arrow === 'ArrowRight') {
			if (inputs[currentInputIndex + 1])
				inputs[currentInputIndex + 1].focus();
		}
	}


	isAllInputsFilled() {
		const inputs = this.querySelectorAll('input');

		for (let input of inputs) {
			if (input.value === '')
				return false;
		}
		return true;
	}


	throwSubmitEvent() {
		const form = document.querySelector('form');

		const event = new CustomEvent('submit', {
			bubbles: true
		});

		form.dispatchEvent(event);
	}
}

customElements.define('two-factor-input-component', TwoFactorInputComponent);