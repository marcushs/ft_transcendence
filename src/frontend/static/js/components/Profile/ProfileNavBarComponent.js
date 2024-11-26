import {getString} from "../../utils/languageManagement.js";
import {sendRequest} from "../../utils/sendRequest.js";

class ProfileNavBarComponent extends HTMLElement {

	constructor() {
		super();

		this.currentState = 'personalInformation';
	}


	async connectedCallback() {
		await this.initializeComponent();
		this.setCurrentState();
		this.querySelector(`li[${this.currentState}]`).className = 'activated-li';
		this.attachEventListener();
	}


	setCurrentState() {
		const currentState = localStorage.getItem('state');

		if (currentState)
			this.currentState = currentState;
	}


	async initializeComponent() {
		try {
			const oauthInfos = await sendRequest("GET", "/api/auth/auth_type/", null);
			const isOauthLog = oauthInfos.oauth_log;

			console.log(isOauthLog)
			if (isOauthLog) {
				this.innerHTML = `
				    <ul>
		                <li state-redirect personalInformation>
		                    <p>${getString('profileNavBarComponent/personalInformation')}</p>
		                </li>
		                <li state-redirect statistics>
		                    <p>${getString('profileNavBarComponent/statistics')}</p>
		                </li>
		            </ul>
				`;
			} else {
				this.innerHTML = `
				    <ul>
		                <li state-redirect personalInformation>
		                    <p>${getString('profileNavBarComponent/personalInformation')}</p>
		                </li>
		                <li state-redirect security>
		                    <p>${getString('profileNavBarComponent/security')}</p>
		                </li>
		                <li state-redirect statistics>
		                    <p>${getString('profileNavBarComponent/statistics')}</p>
		                </li>
		            </ul>
				`;
			}
		} catch (error) {
			console.error(error);
		}
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