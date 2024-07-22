class ProfileNavBarComponent extends HTMLElement {

	constructor() {
		super();

		this.currentState = 'personalInformation';
		this.initializeComponent();
	}


	setCurrentState() {
		const currentState = localStorage.getItem('state');

		if (currentState)
			this.currentState = currentState;
	}


	initializeComponent() {
		this.innerHTML = `
		    <ul>
                <li state-redirect personalInformation>
                    <p>Personal information</p>
                </li>
                <li state-redirect security>
                    <p>Security</p>
                </li>
                <li state-redirect statsAndRank>
                    <p>Stats and rank</p>
                </li>
            </ul>
		`;
	}


	connectedCallback() {
		this.setCurrentState();
		this.querySelector(`li[${this.currentState}]`).className = 'activated-li';
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