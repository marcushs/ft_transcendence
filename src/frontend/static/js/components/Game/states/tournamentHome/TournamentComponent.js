import { getString } from "../../../../utils/languageManagement.js";

export class TournamentComponent extends HTMLElement {
	constructor(tournamentData) {
		super();
		this.tournamentData = tournamentData
		console.log(this.tournamentData);
		this.render();
	}

	render() {
		this.innerHTML =  `
			<div class="joinable-tournament">
				<div class="tournament-left-infos">
					<p class="tournament-name">${this.tournamentData.tournament_name}</p>
				</div>
				<div class="tournament-right-infos">
					<p>${this.tournamentData.member_count}/${this.tournamentData.tournament_size}</p>
					<button-component label="${getString('buttonComponent/join')}" class="generic-btn"></button-component>
				</div>
			</div>
		`;
	}
}

customElements.define('tournament-component', TournamentComponent);
