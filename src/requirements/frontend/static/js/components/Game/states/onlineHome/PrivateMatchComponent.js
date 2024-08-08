import {getString} from "../../../../utils/languageManagement.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="15">
				<button-component label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
				<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel"> <!-- While waiting for backend implementation -->
			</div>
		`;

		this.attachEventsListener();
	}

	attachEventsListener() {
		this.querySelector('button-component').addEventListener('click', () => {
			this.handlePlayButtonClick();
		})
	}

	handlePlayButtonClick() {
		// Do something
		const input = this.querySelector('input');

		if (input.value === '' && !this.querySelector('.invite-player-field-error')) {
			const errorElement = document.createElement('p');

			errorElement.className = 'invite-player-field-error';
			errorElement.innerText = 'The player name cannot be empty';
			this.querySelector('.private-match-component-content').appendChild(errorElement);
		} else if (input.value !== '') {
			// fetch
		}
		// Add error if player doesn't exist
	}

}

customElements.define('private-match-component', PrivateMatchComponent);