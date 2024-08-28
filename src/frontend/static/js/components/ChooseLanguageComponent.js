import {loadLanguagesJson, getUserLanguage, setUserLanguageInDb} from "../utils/languageManagement.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";

class ChooseLanguageComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.languages = {
			fr: false,
			en: false,
			zh: false
		}
		this.isAnimabled = true;
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
		await this.setCurrentLanguage();
		this.generateCurrentLanguageElement();
		this.generateOtherLanguagesElements();
		this.attachEventListener();
	}


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
		// console.log(otherLanguages);
		// console.log(ulElement);
	}


	attachEventListener() {
		const chosenLanguageElement = this.querySelector('.chosen-language');
		const languagesInList = this.querySelectorAll('.language-list .language');

		this.querySelector('.language-list').addEventListener('click', async (event) => {
			if (event.target.classList.contains('flag')) {
				localStorage.setItem('userLanguage', event.target.id);
				await setUserLanguageInDb(event.target.id);
				await loadLanguagesJson();
				throwRedirectionEvent('/')
			}
		})

		this.addEventListener('click', event => event.stopPropagation())

		document.addEventListener('click', () => this.handleClickOutOfComponent())

		chosenLanguageElement.addEventListener('click', (event) => this.handleClickOnChosenLanguage(chosenLanguageElement));
	}


	handleClickOnChosenLanguage(chosenLanguageElement) {
		const list = this.querySelector('.language-list');
		const chosenLanguageCaret = chosenLanguageElement.querySelector('i');

		if (this.isAnimabled === false) // To not throw animation if one is already in progress
			return ;

		if (getComputedStyle(list).display === 'none')
			this.openListAnimation(list, chosenLanguageCaret);
		else
			this.closeListAnimation(list, chosenLanguageCaret);
	}


	openListAnimation(list, chosenLanguageCaret) {
		this.isOpen = true;
		this.isAnimabled = false;
		setTimeout(() => {
			this.isAnimabled = true;
		}, 500);

		chosenLanguageCaret.style.animation = 'animate-caret-up 0.5s ease forwards';

		list.style.display = 'block';
		list.style.animation = 'animate-list-open 0.5s ease forwards';

		this.querySelector('ul li:nth-child(1)').style.animation = '';
		this.querySelector('ul li:nth-child(2)').style.animation = '';
		setTimeout(() => {
			this.querySelector('ul li:nth-child(1)').style.animation = 'animate-flag-appearance 0.4s ease forwards';
		}, 200);
		setTimeout(() => {
			this.querySelector('ul li:nth-child(2)').style.animation = 'animate-flag-appearance 0.4s ease forwards';
		}, 400)
	}


	closeListAnimation(list, chosenLanguageCaret) {
		this.isOpen = false;
		this.isAnimabled = false;
		setTimeout(() => {
			this.isAnimabled = true;
		}, 500);

		chosenLanguageCaret.style.animation = 'animate-caret-down 0.5s ease forwards';

		list.style.animation = 'animate-list-close 0.5s ease forwards';
		setTimeout(() => {
			list.style.display = 'none';
		}, 500);

		setTimeout(() => {
			this.querySelector('ul li:nth-child(1)').style.animation = 'animate-flag-disappearance 0.1s ease forwards';
		}, 100);
		this.querySelector('ul li:nth-child(2)').style.animation = 'animate-flag-disappearance 0.1s ease forwards';
	}


	handleClickOutOfComponent() {
		if (this.isAnimabled && this.isOpen)
			this.closeListAnimation(this.querySelector('.language-list'), this.querySelector('i'));
	}

}

customElements.define('choose-language-component', ChooseLanguageComponent);