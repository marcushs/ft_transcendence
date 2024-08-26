import {getString, getUserLanguage} from "../../../../utils/languageManagement.js";

class LocalComponent extends HTMLElement {

	constructor() {
		super();

		this.innerHTML = `
			<div class="local-component-content">
				<div class="settings-container">
					<div class="score-to-win">
						<p class="setting-name">${getString('gameComponent/scoreToWin')}</p>
						<div class="setting-values-container">
							<button-component label="5" class="score-to-win-inactive"></button-component>
							<button-component label="10" class="score-to-win-active"></button-component>
							<button-component label="20" class="score-to-win-inactive"></button-component>
							<button-component label="30" class="score-to-win-inactive"></button-component>
						</div>
					</div>
					<div class="paddle-speed">
						<p class="setting-name">${getString('gameComponent/paddleSpeed')}</p>
						<div class="setting-values-container">
							<input id="paddleSpeedInput" type="range" min="1" max="9">
							<p id="paddleSpeedValue" class="setting-speed-value">5</p>
						</div>
					</div>
					<div class="ball-speed">
						<p class="setting-name">${getString('gameComponent/ballSpeed')}</p>
						<div class="setting-values-container">
							<input id="ballSpeedInput" type="range" min="1" max="9">
							<p id="ballSpeedValue" class="setting-speed-value">5</p>
						</div>
					</div>
				</div>
				<button-component id="localPlay" label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
			</div>
		`;

		this.scoreToWin = '10';
		this.paddleSpeed = '5';
		this.ballSpeed = '5';
	}


	async connectedCallback() {
		if (await getUserLanguage() === 'fr')
			this.className = 'local-component-french';
		this.attachEventsListener();
	}

	attachEventsListener() {
		const scoreToWinButtons = document.querySelectorAll('.score-to-win > .setting-values-container > button-component');
		const paddleSpeedInput = this.querySelector('#paddleSpeedInput');
		const ballSpeedInput = this.querySelector('#ballSpeedInput');

		scoreToWinButtons.forEach(button => {
			button.addEventListener('click', () => this.handleChangeScoreToWin(button, scoreToWinButtons));
		});

		paddleSpeedInput.addEventListener('input', () => {
			this.handleInputValueChanged(paddleSpeedInput, this.paddleSpeed, '#paddleSpeedValue')
		});

		ballSpeedInput.addEventListener('input', () => {
			this.handleInputValueChanged(ballSpeedInput, this.ballSpeed, '#ballSpeedValue');
		});

		this.querySelector('#localPlay').addEventListener('click', () => this.handlePlayButtonClick());
	}

	handleChangeScoreToWin(clickedButton, scoreToWinButtons) {
		scoreToWinButtons.forEach((button) => {
			if (button !== clickedButton && button.className === 'score-to-win-active') {
				button.className = 'score-to-win-inactive';
			}
		});
		if (clickedButton.className !== 'score-to-win-active') {
			clickedButton.className = 'score-to-win-active';
			this.scoreToWin = clickedButton.innerText;
		}
	}

	handleInputValueChanged(input, valueToChange, displayedValueId) {
		valueToChange = input.value;
		this.querySelector(displayedValueId).innerText = input.value;
	}

	handlePlayButtonClick() {
		// Start game in local
	}

}

customElements.define('local-component', LocalComponent);