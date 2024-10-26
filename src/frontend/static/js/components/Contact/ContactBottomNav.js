class ContactBottomNav extends HTMLElement {
	constructor() {
        super();

		this.innerHTML = 
		`
			<div class='bottom-nav-contacts'>
                <p id="bottom-nav-contact-icon">Contacts</p>
                <img id="bottom-nav-contact-icon" src='../../assets/contact.svg' alt='contact-icon'>
            </div>
		`
    }

}

customElements.define("contact-bottom-nav", ContactBottomNav);