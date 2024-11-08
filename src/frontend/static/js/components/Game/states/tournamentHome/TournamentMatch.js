import { getUserId } from "../../../../utils/chatUtils/joinRoomUtils.js";

export default class TournamentMatch {
	constructor(tournamentBracket) {
		this.redirectState = "tournament-match";
		this.class = "tournament-match";
		let jsonString = JSON.stringify(tournamentBracket);
		this.tournamentBracket = jsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
	}

	render() {
		return `<tournament-match data-tournament-match="${this.tournamentBracket}"></tournament-match>`;
	}
}

class TournamentMatchElement extends HTMLElement {
	constructor() {
		super();
		const tournamentBracket = JSON.parse(this.getAttribute('data-tournament-match'));

		this.tournamentId = tournamentBracket.tournament.tournament_id;
		this.tournamentName = tournamentBracket.tournament.tournament_name;
		this.tournamentSize = tournamentBracket.tournament.tournament_size;
		this.stage = tournamentBracket.tournament.current_stage;
		this.matches = tournamentBracket[this.stage];
		this.clientMatch = null;
		this.userId = null;
	}

	async connectedCallback() {
		await this.findMatch();
		await this.render();
	}

	async render() {
		this.innerHTML = `
			<div class="waiting-room" data-tournament="${this.tournamentId}">
				<h3 class="waiting-room-title">Waiting Room</h3>
				<div class="waiting-room-background">
					<div class="tournament-match-content">
						<div class="bracket-btn">
							<img id="bracket-icon" src="../../../../assets/bracket_icon.svg" alt="bracket_icon">
						</div>
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>Stage: <span>${this.formatCurrentStage(this.stage)}</span></p>
						<p>Opponent: <span>${this.getOpponent()}</span></p>
						<div class="countdown-container">
							<button type="button" class="tournament-match-ready-btn">Ready</button>
							<p class="match-countdown">Match starts in <span>47s</span></p>
						</div>
					</div>
				</div>
			</div>
		`;	
	}

	formatCurrentStage(round) {
		if (round === 'eighth_finals') return "Round of sixteen";

		round = round.replace('_', '-');
		return round[0].toUpperCase() + round.slice(1);
	}

	async findMatch() {
		this.userId = await getUserId();
		
		if (!this.userId) return ;

		this.clientMatch = this.matches.find(match => 
			match.players.some(player => player.id === this.userId)
		);
	}

	getOpponent() {
		return this.clientMatch.players[0].id === this.userId ? this.clientMatch.players[1].username : this.clientMatch.players[0].username;
	}
}

customElements.define('tournament-match', TournamentMatchElement);
