import {getString} from "../../../../utils/languageManagement.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
				<button-component label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
				<img src="../../../../../assets/invite_player.svg" alt="invite player" class="invite-icon">
				<p class="invite-player-field-error"></p>
<!--				<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel"> &lt;!&ndash; While waiting for backend implementation &ndash;&gt;-->
			</div>
		`;

		this.attachEventsListener();
	}

	attachEventsListener() {
		this.querySelector('button-component').addEventListener('click', () => {
			this.handlePlayButtonClick();
		});

		this.querySelector('input').addEventListener('input', () => {
			this.resetError();
		})
	}

	handlePlayButtonClick() {
		const input = this.querySelector('input');

		if (input.value === '' && this.querySelector('.invite-player-field-error').innerText === '') {
			this.querySelector('.invite-player-field-error').innerText = 'The player name cannot be empty';
		} else if (input.value !== '') {
			// fetch
		}
	}


	resetError() {
		this.querySelector('.invite-player-field-error').innerHTML = '';
	}

}

customElements.define('private-match-component', PrivateMatchComponent);