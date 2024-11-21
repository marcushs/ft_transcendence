import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import BracketObj from "./bracket/BracketObj.js";
import { redirectToTournamentHome } from "../../../../utils/tournamentUtils/joinTournamentUtils.js";

export default class TournamentWon {
	constructor(tournamentBracket) {
		this.redirectState = "tournament-won";
		this.class = "tournament-won";
		let tournamentBracketJsonString = JSON.stringify(tournamentBracket);
		//html encode
		this.tournamentBracket = tournamentBracketJsonString.replace(/&/g, '&amp;')
															.replace(/'/g, '&apos;')
															.replace(/"/g, '&quot;')
															.replace(/</g, '&lt;')
															.replace(/>/g, '&gt;');
	}

	render() {
		return `<tournament-wonz data-tournament-bracket="${this.tournamentBracket}"></tournament-wonz>`;
	}
}

class TournamentWonElement extends HTMLElement {
	constructor() {
		super();
		this.tournamentBracket = JSON.parse(this.getAttribute('data-tournament-bracket'));

		this.tournamentId = this.tournamentBracket.tournament.tournament_id;
		this.tournamentName = this.tournamentBracket.tournament.tournament_name;
		this.tournamentSize = this.tournamentBracket.tournament.tournament_size;
		this.bracketObj = BracketObj.create(this.tournamentBracket, this.tournamentSize);
		this.alias = this.tournamentBracket.alias;
	}
	
	async connectedCallback() {
		await this.render();
		this.addEventListeners();
		this.sendStartCountdown();
	}

	async render() {
		this.innerHTML = `
			<div class="tournament-won" data-tournament="${this.tournamentId}">
				<h3 class="tournament-won-title">Winner!</h3>
				<div class="tournament-won-background">
					<div class="tournament-match-content">
						<div class="bracket-btn">
							<img id="bracket-icon" src="../../../../assets/bracket_icon.svg" alt="bracket_icon">
						</div>
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>Congratulations <span>${this.alias}</span>!</p>
						<p>You won the tournament <span>${this.tournamentName}</span>!</p>
						<img id="trophy" src="../../../../assets/trophy.svg" alt="trophy"">
						<div class="countdown-container">
							<button type="button" class="tournament-lost-leave-btn">Leave</button>
							<p class="tournament-lost-countdown">Leaving automatically in <span>59</span>s</p>
						</div>
					</div>
				</div>
			</div>
		`;	
	}

	addEventListeners() {
		const bracketBtn = this.querySelector('#bracket-icon');
		const leaveBtn = this.querySelector('.tournament-lost-leave-btn');

		bracketBtn.addEventListener('click', () => {
			console.log('clicked on bracket')
			console.log('bracketObj', this.bracketObj);
			this.redirectToBracket();
		})
		
		leaveBtn.addEventListener('click', () => {
			const payload = {
				'type': 'leave_tournament',
				'tournament_id': this.tournamentId,
				'from_match': true
			};

			tournamentSocket.send(JSON.stringify(payload))
			redirectToTournamentHome()
		})
	}

	redirectToBracket() {
		const gameComponent = document.querySelector('game-component');
		const bracketState = gameComponent.states['bracket'];
		const bracket = new Bracket(this.bracketObj);
	
		bracketState['state'] = bracket;
		gameComponent.changeState(bracketState.state, "/tournamentWon/bracket");
		gameComponent.currentState = "bracket";
	}

	sendStartCountdown() {
		const payload = {
			'type': 'start_leave_countdown',
			'tournament_id': this.tournamentId
		};

		tournamentSocket.send(JSON.stringify(payload))
	}

	updateCountdownSeconds(time) {
		const secondsSpan = this.querySelector('.tournament-lost-countdown span');

		if (!secondsSpan) return;

		secondsSpan.innerText = time;
	}
}

customElements.define('tournament-won', TournamentWonElement);
