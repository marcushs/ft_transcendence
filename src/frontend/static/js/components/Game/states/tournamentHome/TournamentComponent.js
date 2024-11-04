import { getString } from "../../../../utils/languageManagement.js";

export class TournamentComponent extends HTMLElement {
	constructor(tournamentData) {
		super();
		this.tournamentName = tournamentData.tournament_name;
		this.tournamentSize = tournamentData.tournament_size;
		this.tournamentMembersCount = tournamentData.member_count;
		this.render();
	}

	render() {
		this.innerHTML =  `
			<div class="joinable-tournament">
				<div class="tournament-left-infos">
					<p class="tournament-name">${this.tournamentName}</p>
				</div>
				<div class="tournament-right-infos">
					<p>${this.tournamentMembersCount}/${this.tournamentSize}</p>
					<button-component label="${getString('buttonComponent/join')}" class="generic-btn"></button-component>
				</div>
			</div>
		`;
	}
}

customElements.define('tournament-component', TournamentComponent);
