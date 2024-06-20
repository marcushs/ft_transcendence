class NavBar extends HTMLElement {
	static get observedAttributes() {
        return ["auth"];
    }

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });

		this.auth = false;
		this.navBar = document.createElement('nav');
		this.navBar.id = 'nav';
		if (!this.auth) {
			this.navBar.innerHTML = `
				<a href="/" data-link>Home</a>
				<a href="/login" data-link>Login</a>
				<a href="/signup" data-link>Signup</a>
			`;
		} else {
			this.navBar.innerHTML = `
				<a href="/logout" data-link>Logout</a>
				<a href="/profile" data-link>Profile</a>
			`;
		}

		const cssLink = document.createElement('link');

		cssLink.setAttribute('rel', 'stylesheet');
		cssLink.setAttribute('href', '../../style/components/NavBar.css');
		this.shadowRoot.appendChild(this.navBar);
        this.shadowRoot.appendChild(cssLink);
	}

	connectedCallback() {
        this.updateNavBar();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'auth') {
            this.auth = newValue === 'true';
            this.updateNavBar();
        }
    }

    updateNavBar() {
        if (this.auth) {
            this.navBar.innerHTML = `
                <a href="/profile" data-link>Profile</a>
                <a href="/logout" data-link>Logout</a>
            `;
        } else {
            this.navBar.innerHTML = `
                <a href="/" data-link>Home</a>
                <a href="/login" data-link>Login</a>
                <a href="/signup" data-link>Signup</a>
            `;
        }
    }
};

customElements.define('nav-bar', NavBar);
