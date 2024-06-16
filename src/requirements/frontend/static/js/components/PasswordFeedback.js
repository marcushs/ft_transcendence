class PasswordFeedback extends HTMLElement {
	static get observedAttributes() {
        return ["active"];
    }

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });

		this.container = document.createElement('div');
		this.container.id = 'password-feedback';
		this.container.innerHTML = `
			<h4 class="feedback-title">Password should be</h4>
			<ul class="feedback">
				<li class="list-item" id="charLen">
					<i class="fa-solid fa-xmark"></i>
					<span>At least 8 character long</span>
				</li>
				<li class="list-item" id="num">
					<i class="fa-solid fa-xmark"></i>
					<span>At least 1 number</span>
				</li>
				<li class="list-item" id="lower">
					<i class="fa-solid fa-xmark"></i>
					<span>At least 1 lowercase letter</span>
				</li>
				<li class="list-item" id="upper">
					<i class="fa-solid fa-xmark"></i>
					<span>At least 1 uppercase letter</span>
				</li>
				<li class="list-item" id="specChar">
					<i class="fa-solid fa-xmark"></i>
					<span>At least 1 special character</span>
				</li>
			</ul>
		`;

		const cssLink = document.createElement('link');
		cssLink.setAttribute('rel', 'stylesheet');
		cssLink.setAttribute('href', '../../style/components/PasswordFeedback.css');

		const fontAwesomeLink = document.createElement('link');
		fontAwesomeLink.setAttribute('rel', 'stylesheet');
		fontAwesomeLink.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css');
		shadow.appendChild(cssLink);
		shadow.appendChild(fontAwesomeLink);
		shadow.appendChild(this.container);
	}

	show() {
		this.container.classList.add('active');
	}

	hide() {
		this.container.classList.remove('active');
	}

	updatePasswordFeedbackDOM(requirements) {
		requirements.forEach(item => {
			const DOMelem = this.shadowRoot.getElementById(`${item.id}`);
			if (item.isValid) {
				DOMelem.classList.add('valid');
				DOMelem.querySelector('i').classList.replace('fa-xmark', 'fa-check');
			} else {
				DOMelem.classList.remove('valid');
				DOMelem.querySelector('i').classList.replace('fa-check', 'fa-xmark');
			}
		});
	}
};

customElements.define("password-feedback", PasswordFeedback);
