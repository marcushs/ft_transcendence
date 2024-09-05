class AcceptedContactRequestNotificationComponent extends HTMLElement {
	constructor() {
		super();

		this.notificationObj = null;
	}


	initializeComponent() {
		this.innerHTML = `
			<li>			
				<p>${this.notificationObj.message}</p>
				<hr>
			</li>
		`;
	}


	connectedCallback() {
		this.notificationObj = JSON.parse(this.getAttribute('notificationObj'));
		this.initializeComponent();
		this.setNotificationClass();
	}


	setNotificationClass() {
		const li = this.querySelector('li');

		if (!this.notificationObj.is_read)
			li.className = 'no-viewed-notification';
	}


	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'notificationObj')
			this.notificationObj = JSON.parse(newValue);
	}


}

customElements.define('accepted-contact-request-notification-component', AcceptedContactRequestNotificationComponent);