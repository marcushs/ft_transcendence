export default class TournamentMatch {
	constructor(tournamentData) {
		this.redirectState = "tournament-match";
		this.class = "tournament-match";
		let jsonString = JSON.stringify(tournamentData);
		this.tournamentData = jsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
	}

	render() {
		return `<tournament-match data-tournament="${this.tournamentData}"></tournament-match>`;
	}
}

class TournamentMatchElement extends HTMLElement {
	constructor() {
		super();
		const tournamentData = JSON.parse(this.getAttribute('data-tournament'));

		this.tournamentId = tournamentData.tournament_id;
		this.tournamentName = tournamentData.tournament_name;
		this.tournamentSize = tournamentData.tournament_size;
		this.stage = '8th final' //tournamentData.stage;
		this.opponent = 'Alex' //tournamentData.opponent;
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.innerHTML = `
			<div class="waiting-room" data-tournament="${this.tournamentId}">
				<h3 class="waiting-room-title">Waiting Room</h3>
				<div class="waiting-room-background">
					<div class="tournament-match-content">
						<div class="bracket-btn">
							<img id="bracket-icon" src="../../../../assets/bracket_icon.svg" alt="bracket_icon">
						</div>
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>Stage: <span>${this.stage}</span></p>
						<p>Opponent: <span>${this.opponent}</span></p>
						<div class="countdown-container">
							<button type="button" class="tournament-match-ready-btn">Ready</button>
							<p class="match-countdown">Match starts in <span>47s</span></p>
						</div>
					</div>
				</div>
			</div>
		`;	
	}
}

customElements.define('tournament-match', TournamentMatchElement);
