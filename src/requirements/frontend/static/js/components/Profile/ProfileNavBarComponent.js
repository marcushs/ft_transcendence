class ProfileNavBarComponent extends HTMLElement {

	constructor() {
		super();

		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
		    <ul>
                <li class="activated-li" state-redirect personalInformation>
                    <p>Personal information</p>
                </li>
                <li state-redirect security>
                    <p>Security</p>
                </li>
                <li>
                    <p>Stats and rank</p>
                </li>
            </ul>
		`;
	}


	connectedCallback() {
		this.attachEventListener();
	}


	attachEventListener() {
		this.addEventListener('click', (event) => {
				this.handleClickOnLiElement(event.target);
		});
	}


	handleClickOnLiElement(targetElement) {
		const liElements = this.querySelectorAll('li');

		liElements.forEach(elem => elem.classList.remove('activated-li'));

		if (targetElement.tagName === 'P')
			targetElement.closest('li').classList.add('activated-li');
		else
			targetElement.classList.add('activated-li');
	}

}

customElements.define('profile-nav-bar-component', ProfileNavBarComponent);