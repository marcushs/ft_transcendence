class EmotesComponent extends HTMLElement {
	constructor() {
		super();

		this.isEmotesOpened = false;
		this.isDisplayEmoteAvailable = true;

		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
			<img src="../../../assets/emotes/emote-choice.png" class="emotes-choice" alt="emotes choice" />
			<div class="emotes-container">
				<img src="../../../assets/emotes/happy/gorilla-happy.png" alt="happy emote" id="gorilla-happy">
				<img src="../../../assets/emotes/mad/gorilla-mad.png" alt="mad emote" id="gorilla-mad">
				<img src="../../../assets/emotes/cry/gorilla-cry.png" alt="cry emote" id="gorilla-cry">
				<img src="../../../assets/emotes/laugh/gorilla-laugh.png" alt="laugh emote" id="gorilla-laugh">
			</div>
			<div class="emote-in-game"></div>
			<div class="opponent-emote-in-game"></div>
		`;
	}


	connectedCallback() {
		this.emotesChoice = this.querySelector('.emotes-choice');
		this.emotesContainer = this.querySelector('.emotes-container');
		this.emotes = this.querySelectorAll('.emotes-container > img');

		this.attachEventListeners();
	}


	attachEventListeners() {
		for (const emote of this.emotes) {
			emote.addEventListener('click', (event) => {
				this.displayEmote(event.target.id.split('-')[1]);
			});
		}

		this.querySelector('.emotes-choice').addEventListener('click', () => this.handleClickOnEmotesChoice());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.closeEmotesContainer());

		this.addEventListener('launchOpponentEmoteEvent', (event) => this.displayEmote(event.detail.emoteType, true));
	}


	displayEmote(emoteType) {
		if (!this.isDisplayEmoteAvailable)
			return;

		let emoteInGame = this.querySelector('.emote-in-game');

		this.isDisplayEmoteAvailable = false;
		this.isEmotesOpened = false;
		this.closeEmotesContainer();

		// const emoteInGameImgElement = document.createElement('img');

		// emoteInGameImgElement.src = `../../../assets/emotes/${emoteType}/gorilla-${emoteType}.gif`;
		// emoteInGame.append(emoteInGameImgElement);

		this.emotesChoice.src = "../../../assets/emotes/emote-choice-unavailable.png";
		this.emotesChoice.style.cursor = 'inherit';
		this.throwSendEmoteEvent(emoteType);

		setTimeout(() => {
			this.emotesChoice.src = "../../../assets/emotes/emote-choice.png";
			this.emotesChoice.style.cursor = 'pointer';
			this.isDisplayEmoteAvailable = true;
			// emoteInGame.innerHTML = '';
		}, 3500);

		this.loadEmoteSound(emoteType);
	}


	displayOpponentEmote(emoteType) {
		let emoteInGame = this.querySelector('.opponent-emote-in-game');

		const emoteInGameImgElement = document.createElement('img');

		emoteInGameImgElement.src = `../../../assets/emotes/${emoteType}/gorilla-${emoteType}.gif`;
		emoteInGame.append(emoteInGameImgElement);

		setTimeout(() => {
			emoteInGame.innerHTML = '';
		}, 3500);

		this.loadEmoteSound(emoteType);
	}


	loadEmoteSound(emoteType) {
		const randomNumber = Math.floor(Math.random() * 4) + 1;
		const sound = new Audio(`../../../assets/emotes/${emoteType}/sounds/gorilla-${emoteType}-sound-${randomNumber}.mp3`);

		sound.play();
	}


	handleClickOnEmotesChoice() {
		if (!this.isDisplayEmoteAvailable)
			return;

		this.emotesChoice.style.display = 'none';
		this.emotesContainer.style.display = 'flex';
		this.isEmotesOpened = true;
	}


	closeEmotesContainer() {
		this.emotesChoice.style.display = 'block';
		this.emotesContainer.style.display = 'none';
		this.isEmotesOpened = false;
	}


	throwSendEmoteEvent(emoteType) {
		const event = new CustomEvent('sendEmoteEvent', {
			bubbles: true,
			detail: {
				emoteType: emoteType
			}
		});

		document.dispatchEvent(event);
	}

}

window.customElements.define('emotes-component', EmotesComponent);