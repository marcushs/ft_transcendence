import {getString} from "../../../../utils/languageManagement.js";
import {sendRequest} from "../../../../utils/sendRequest.js";
import {matchmakingWebsocket} from "../../../../utils/matchmaking/matchmakingWebsocket.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
				<button-component label="${getString('buttonComponent/invite')}" class="generic-btn-disabled"></button-component>
				<p class="invite-player-field-error"></p>
				<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel" style="visibility: hidden">
			</div>
		`;

		this.attachEventsListener();
		this.state = "initial";
	}

	attachEventsListener() {
		const input = this.querySelector('input');
		const button = this.querySelector('button-component');

		button.addEventListener('click', async () => {
			console.log(button.className)
			switch (this.state) {
				case 'initial':
					if (button.className === "generic-btn")
						await this.handlePlayButtonClick();
					break ;
				case 'waiting':
					this.displayWaitingState();
					break ;

			}
		});

		input.addEventListener('input', () => {
			this.resetError();
			if (input.value !== '')
				button.className = "generic-btn";
			else
				button.className = "generic-btn-disabled";
		});


		document.addEventListener('playerJoinedMatchEvent', () => {
			alert('test')
		});

	}

	async handlePlayButtonClick() {
		console.log('test')
		const input = this.querySelector('input');

		if (input.value === '' && this.querySelector('.invite-player-field-error').innerText === '') {
			this.querySelector('.invite-player-field-error').innerText = 'The player name cannot be empty';
		} else if (input.value !== '') {
			const matchmakingSocket = await matchmakingWebsocket();
			try {
				await sendRequest("POST", "/api/matchmaking/init_private_match/", {
					invitedUsername: input.value,
				});
				this.displayLobby();
			} catch (error) {
				console.log(error);
			}
		}
	}


	displayWaitingState() {
		this.querySelector('img').style.visibility = "visible";
		this.querySelector('button-component button').innerHTML = getString("buttonComponent/cancel");
		// this.querySelector('button-component').remove();


		// this.querySelector('.private-match-component-content').innerHTML = `
		// 		<h4>${getString('gameComponent/privateMatch')}</h4>
		// 		<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
		// 		<button-component label="${getString('buttonComponent/cancel')}" class="generic-btn"></button-component>
		// 		<p class="invite-player-field-error"></p>
		// 		<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel" style="visibility: hidden">
		// 	`;



	}


	displayLobby() {

	}


	resetError() {
		this.querySelector('.invite-player-field-error').innerHTML = '';
	}

}

customElements.define('private-match-component', PrivateMatchComponent);