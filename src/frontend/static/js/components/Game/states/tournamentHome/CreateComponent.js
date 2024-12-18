import {getString} from "../../../../utils/languageManagement.js";
import { tournamentSocket, loadTournamentWebSocket } from "../../../../views/websocket/loadWebSocket.js";

class CreateComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="create-component-content">
				<h4>${getString('buttonComponent/create')}</h4>
				<div class="create-component-infos-container">
					<div class="tournament-name-container">
						<input type="text" placeholder="${getString('gameComponent/tournamentName')}" maxlength="30">
					</div>
					<div class="number-of-players-container">
						<p>${getString('gameComponent/numberOfPlayers')}</p>
						<div class="buttons-container">
							<button-component id="4-players-tournament" label="4" class="player-number-inactive"></button-component>
							<button-component id="8-players-tournament" label="8" class="player-number-active"></button-component>
						</div>
					</div>
				</div>
				<button-component id="createTournament" label="${getString('buttonComponent/create')}" class="generic-btn"></button-component>
			</div>
		`;

		this.numberOfPlayers = '8';
		this.tournamentName = '';

		this.attachEventsListener();
	}

	attachEventsListener() {
		const numberOfPlayersButtons = document.querySelectorAll('.buttons-container > button-component');

		numberOfPlayersButtons.forEach(button => {
			button.addEventListener('click', () => this.handleChangeNumberOfPlayers(button, numberOfPlayersButtons));
		});

		this.querySelector('#createTournament').addEventListener('click', () => {
			this.handleCreateButtonClick();
		});
	}

	handleChangeNumberOfPlayers(clickedButton, numberOfPlayersButtons) {
		numberOfPlayersButtons.forEach((button) => {
			if (button !== clickedButton && button.className === 'player-number-active') {
				button.className = 'player-number-inactive';
			}
		});
		if (clickedButton.className !== 'player-number-active') {
			clickedButton.className = 'player-number-active';
			this.numberOfPlayers = clickedButton.innerText;
		}
	}

	handleCreateButtonClick() {
		this.tournamentName = this.querySelector('input').value.trim();

		if (this.tournamentName === '' && !this.querySelector('.create-tournament-error')) {
			const errorElement = document.createElement('p');

			errorElement.className = 'create-tournament-error';
			errorElement.innerText = 'The tournament name cannot be empty';
			this.querySelector('.tournament-name-container').appendChild(errorElement);
		} else if (this.tournamentName.length > 0 && this.tournamentName.length <=30) {
			const payload = {
				'type': 'create_tournament',
				'tournament_name': this.tournamentName,
				'tournament_size': this.numberOfPlayers,
			};
			if (!tournamentSocket || tournamentSocket.readyState !== WebSocket.OPEN)
				loadTournamentWebSocket()
			tournamentSocket.send(JSON.stringify(payload));
		}
	}

}

customElements.define('create-component', CreateComponent);
