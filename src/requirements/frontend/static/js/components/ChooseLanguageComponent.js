class ChooseLanguageComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.isAnimabled = true;
		this.isOpen = false;
	}


	initializeComponent() {
		this.innerHTML = `
			<div class="language-selector">
				<div class="chosen-language language">
					<img src="../../assets/french-flag.png" alt="french flag" class="flag">
					<i class="fa-solid fa-caret-down"></i>
				</div>
				<div class="language-list">				
					<ul>
						<li class="language">
							<img src="../../assets/uk-flag.png" alt="uk flag" class="flag">
						</li>
						<li class="language">
							<img src="../../assets/chinese-flag.png" alt="chinese flag" class="flag">
						</li>
					</ul>
				</div>
				
			</div>
		`;
	}


	connectedCallback() {
		this.attachEventListener();
	}


	attachEventListener() {
		const chosenLanguageElement = this.querySelector('.chosen-language');
		// const languagesInList = this.querySelectorAll('.language-list .language');

		// languagesInList.forEach(elem => {
		// 	elem.addEventListener('click', (event) => {
		// 		const chosenLanguageImg = this.querySelector('.chosen-language > img');
		// 		const newChosenLanguageImg = elem.querySelector('img');
		//
		// 		elem.removeChild(newChosenLanguageImg);
		// 		elem.appendChild(chosenLanguageImg);
		//
		// 		// this.querySelector('.chosen-language').removeChild(chosenLanguageImg);
		// 		const chosenLanguageElement = this.querySelector('.chosen-language');
		// 		chosenLanguageElement.insertBefore(newChosenLanguageImg, chosenLanguageElement.firstChild);
		// 	});
		// })

		this.addEventListener('click', event => event.stopPropagation())

		document.addEventListener('click', () => this.handleClickOutOfComponent())

		chosenLanguageElement.addEventListener('click', (event) => this.handleClickOnChosenLanguage(chosenLanguageElement));
	}


	handleClickOnChosenLanguage(chosenLanguageElement) {
		const list = this.querySelector('.language-list');
		const chosenLanguageCaret = chosenLanguageElement.querySelector('i');

		if (this.isAnimabled === false) // To not throw animation if one is already in progress
			return ;
		if (getComputedStyle(list).display === 'none') {
			this.openListAnimation(list, chosenLanguageCaret);
		} else {
			this.closeListAnimation(list, chosenLanguageCaret);
		}
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