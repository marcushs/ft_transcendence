class TwoFactorInputComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `
	        <input id="0" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required autofocus>
            <input id="1" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required>
            <input id="2" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required>
            <input id="3" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required>
            <input id="4" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required>
            <input id="5" type="text" maxlength="1" inputmode="numeric" autocomplete="off" required>
		`;
	}


	connectedCallback() {
		this.attachEventListeners();
	}


	attachEventListeners() {
		const inputs = document.querySelectorAll('input');

		inputs.forEach((input) => {
			input.addEventListener('input', event => this.handleInputEvent(event, inputs))
		});

		inputs.forEach((input) => {
			input.addEventListener('keydown', event => this.handleInputDeleted(event, inputs))
		});
	}


	handleInputEvent(event, inputs) {

		// To delete the character if isn't a digit
		if (isNaN(event.target.value)) {
			event.target.value = '';
			return ;
		}

		if (event.target.value === '')
			return ;

		const focusedIndex = parseInt(event.target.id);
		let newFocusedInputIndex = this.getNextInputIndex(inputs, focusedIndex);

		if (newFocusedInputIndex < 6 && newFocusedInputIndex > -1)
			inputs[newFocusedInputIndex].focus();
	}


	handleInputDeleted(event, inputs) {

		if (event.code !== 'Backspace' || event.target.id === '0')
			return ;

		const newFocusedInputIndex = parseInt(event.target.id) - 1;
		const newFocusedInputValue = inputs[newFocusedInputIndex].value;

		event.target.value = '';

		if (newFocusedInputIndex < 6 && newFocusedInputIndex > -1) {
			inputs[newFocusedInputIndex].focus();
			setTimeout(() => {
				inputs[newFocusedInputIndex].value = newFocusedInputValue;
			}, 0)
		}
	}


	getNextInputIndex(inputs, focusedIndex) {
		let slicedInputs = [...inputs].slice(focusedIndex + 1);

		for (const input of slicedInputs) {
			if (input.value === '')
				return parseInt(input.id);
		}
	}

}

customElements.define('two-factor-input-component', TwoFactorInputComponent);