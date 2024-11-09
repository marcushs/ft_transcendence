import { getString } from "../../../../utils/languageManagement.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";

export class TournamentComponent extends HTMLElement {
	constructor(tournamentData) {
		super();
		this.tournamentId = tournamentData.tournament_id;
		this.tournamentName = tournamentData.tournament_name;
		this.tournamentSize = tournamentData.tournament_size;
		this.tournamentMembersCount = tournamentData.member_count;
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML =  `
			<div class="joinable-tournament">
				<div class="tournament-left-infos">
					<p class="tournament-name">${this.tournamentName}</p>
				</div>
				<div class="tournament-right-infos">
					<p>${this.tournamentMembersCount} / ${this.tournamentSize}</p>
					<button-component label="${getString('buttonComponent/join')}" class="generic-btn"></button-component>
				</div>
			</div>
		`;
	}

	addEventListeners() {
		const btn = this.querySelector('button-component');

		btn.addEventListener('click', () => {
			const payload = {
				'type': 'join_tournament',
				'tournament_id': this.tournamentId,
			};

			tournamentSocket.send(JSON.stringify(payload))
		});
	}
}

customElements.define('tournament-component', TournamentComponent);
