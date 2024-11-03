export class TournamentComponent extends HTMLElement {
	constructor(tournamentData) {
		super();
		this.tournamentData = JSON.parse(tournamentData)
		this.render();
	}

	render() {
		console.log(this.tournamentData);
		this.innerHTML =  `
			<div class="joinable-tournament">
				<div class="tournament-left-infos">
					<p class="tournament-name">Tournament name</p>
				</div>
				<div class="tournament-right-infos">
					<p>10</p>
					<button-component label="${getString('buttonComponent/join')}" class="generic-btn"></button-component>
				</div>
			</div>
		`;
	}
}

customElements.define('tournament-component', TournamentComponent);
