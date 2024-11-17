import {loadLanguagesJson, getUserLanguage, setUserLanguageInDb} from "../utils/languageManagement.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import checkAuthentication from "../utils/checkAuthentication.js";

class ChooseLanguageComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.languages = {
			fr: false,
			en: false,
			zh: false
		}
		this.isOpen = false;
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="language-selector">
				<div class="chosen-language language">
					<i class="fa-solid fa-caret-down"></i>
				</div>
				<div class="language-list">				
					<ul></ul>
				</div>
				
			</div>
		`;
	}


	async connectedCallback() {
		this.isAuthenticated = await checkAuthentication();
		await this.setCurrentLanguage();
		this.generateCurrentLanguageElement();
		this.generateOtherLanguagesElements();
		this.attachEventListener();
	}


	attachEventListener() {
		const chosenLanguageElement = this.querySelector('.chosen-language');

		this.querySelector('.language-list').addEventListener('click', event => this.handleClickOnNewLanguage(event));

		document.addEventListener('closeChooseLanguageComponent', () => this.handleCloseChooseLanguageComponentEvent());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.handleClickOutOfComponent());

		chosenLanguageElement.addEventListener('click', (event) => this.handleClickOnChosenLanguage(chosenLanguageElement));
	}


	// Setters / getters

	async setCurrentLanguage() {
		this.languages[localStorage.getItem("userLanguage")] = true;
	}


	getCurrentLanguage() {
		if (this.languages.en === true)
			return 'en';
		else if (this.languages.fr === true)
			return 'fr';
		else if (this.languages.zh === true)
			return 'zh';
	}


	getOtherLanguages() {
		const otherLanguages = [];

		if (this.languages.en === false)
			otherLanguages.push('en');
		if (this.languages.fr === false)
			otherLanguages.push('fr');
		if (this.languages.zh === false)
			otherLanguages.push('zh');

		return otherLanguages;
	}


	// Generate elements

	generateFlagImgElement(language) {
		const imgElement = document.createElement("img");

		imgElement.id = language;
		imgElement.className = 'flag';

		if (language === 'en') {
			imgElement.src = '"../../assets/uk-flag.png';
			imgElement.alt = 'uk flag';
		} else if (language === 'fr') {
			imgElement.src = '"../../assets/french-flag.png';
			imgElement.alt = 'french flag';
		} else if (language === 'zh') {
			imgElement.src = '"../../assets/chinese-flag.png';
			imgElement.alt = 'chinese flag';
		}

		return imgElement;
	}


	generateCurrentLanguageElement() {
		const chosenLanguage = this.querySelector('.chosen-language');
		const currentLanguageFlag = this.generateFlagImgElement(this.getCurrentLanguage());

		chosenLanguage.insertBefore(currentLanguageFlag, chosenLanguage.firstChild);
	}


	generateOtherLanguagesElements() {
		const otherLanguages = this.getOtherLanguages();
		const ulElement = this.querySelector('ul');

		otherLanguages.forEach(language => {
			const liElement = document.createElement("li");
			const imgFlag = this.generateFlagImgElement(language);

			liElement.className = 'language';
			liElement.appendChild(imgFlag);
			ulElement.appendChild(liElement);
		});
	}


	// Handle events

	async handleClickOnNewLanguage(event) {
		if (event.target.classList.contains('flag')) {
			localStorage.setItem('userLanguage', event.target.id);
			if (this.isAuthenticated)
				await setUserLanguageInDb(event.target.id);
			await loadLanguagesJson();
			throwRedirectionEvent(`${localStorage.getItem('lastAuthorizedPage')}`);
		}
	}


	async handleClickOnChosenLanguage(chosenLanguageElement) {
		const list = this.querySelector('.language-list');
		const chosenLanguageCaret = chosenLanguageElement.querySelector('i');

		if (getComputedStyle(list).display === 'none') {
			this.closeOtherNavBarComponent();
			this.openListAnimation(list, chosenLanguageCaret);
		}
		else {
			this.closeListAnimation(list, chosenLanguageCaret);
		}
	}


	closeOtherNavBarComponent() {
		const notificationsMenu = document.querySelector('.notifications-container-background');
		const accountInfosMenu = document.querySelector('.account-menu-background');

		if (notificationsMenu && getComputedStyle(notificationsMenu).display !== 'none')
			this.throwCloseNotificationsContainerEvent();
		if (accountInfosMenu && getComputedStyle(accountInfosMenu).display !== 'none')
			this.throwCloseAccountInfosComponentEvent();
	}


	handleClickOutOfComponent() {
		if (this.isOpen)
			this.closeListAnimation(this.querySelector('.language-list'), this.querySelector('i'));
	}


	handleCloseChooseLanguageComponentEvent() {
		this.closeListAnimation(this.querySelector('.language-list'), this.querySelector('i'));
	}


	// Throw events

	throwCloseNotificationsContainerEvent() {
		const event = new CustomEvent('closeNotificationsContainer', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	throwCloseAccountInfosComponentEvent() {
		const event = new CustomEvent('closeAccountInfosComponent', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	// Animations

	openListAnimation(list, chosenLanguageCaret) {
		const notificationComponent = document.querySelector('notification-component');
		this.style.zIndex = '3';
		this.isOpen = true;

		chosenLanguageCaret.style.animation = 'animate-caret-up 0.3s ease forwards';
		if (notificationComponent)
			notificationComponent.style.zIndex = '2';

		list.style.display = 'block';
		list.style.animation = 'animate-list-open 0.3s ease forwards';

		this.querySelector('ul li:nth-child(1)').style.animation = 'animate-flag-appearance 0.2s ease forwards';
		this.querySelector('ul li:nth-child(2)').style.animation = 'animate-flag-appearance 0.3s ease forwards';
	}


	closeListAnimation(list, chosenLanguageCaret) {
		this.style.zIndex = '2';
		this.isOpen = false;

		chosenLanguageCaret.style.animation = 'animate-caret-down 0.3s ease forwards';

		list.style.animation = 'animate-list-close 0.3s ease forwards';
		setTimeout(() => {
			list.style.display = 'none';
		}, 300);

		this.querySelector('ul li:nth-child(1)').style.animation = 'animate-flag-disappearance 0.1s ease forwards';
		this.querySelector('ul li:nth-child(2)').style.animation = 'animate-flag-disappearance 0.1s ease forwards';
	}

}

customElements.define('choose-language-component', ChooseLanguageComponent);