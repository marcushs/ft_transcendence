import {getString} from "../../utils/languageManagement.js";

class GameTopBarComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="top-bar-options">			
				<div class="back-button">
					<img src="../../../assets/backTopBarButton.svg" alt="back top bar button">
					<p>${getString('gameTopBar/back')}</p>
				</div>
				<div class="game-settings">
					<img src="../../../assets/extendGameButton.svg" alt="extend game button" class="extend-game-button">
					<img src="../../../assets/reduceGameButton.svg" alt="reduce game button" class="reduce-game-button">
				</div>
			</div>
		`;

		this.backButton = this.querySelector('.back-button');
		this.extendGameButton = this.querySelector('.extend-game-button');
		this.reduceGameButton = this.querySelector('.reduce-game-button');
		this.throwEvents();
	}

	throwEvents() {
		this.backButton.addEventListener('click', () => {
			const event = new CustomEvent('navigate-back', {
				bubbles: true // To navigate throughout DOM
			});

			this.dispatchEvent(event);
		});

		this.extendGameButton.addEventListener('click', async () => {
			const event = new CustomEvent('extend-game', {
				bubbles: true
			});

			this.dispatchEvent(event);
		});

		this.reduceGameButton.addEventListener('click', async () => {
			const event = new CustomEvent('reduce-game', {
				bubbles: true
			});

			this.dispatchEvent(event);
		});
	}

}

window.customElements.define('game-top-bar', GameTopBarComponent);