import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import BracketObj from "./bracket/BracketObj.js";
import { redirectToTournamentHome } from "../../../../utils/tournamentUtils/joinTournamentUtils.js";

export default class TournamentLost {
	constructor(match) {
		this.redirectState = "tournament-lost";
		this.class = "tournament-lost";
		let jsonString = JSON.stringify(match);
		this.match = jsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
	}

	render() {
		return `<tournament-lost data-tournament-match="${this.match}"></tournament-lost>`;
	}
}

class TournamentLostElement extends HTMLElement {
	constructor() {
		super();
		this.match = JSON.parse(this.getAttribute('data-tournament-match'));
		this.tournamentId = this.match.tournament_id;
		this.tournamentName = this.match.tournament_name;
		this.bracketObj = null;
		console.log('asdfsfdsdfq4erwqerqwer ', this.match)
		this.stage = this.match.tournament_round;
	}
	
	async connectedCallback() {
		await this.render();
		this.addEventListeners();
	}

	async render() {
		this.innerHTML = `
			<div class="tournament-lost" data-tournament="${this.tournamentId}">
				<h3 class="tournament-lost-title">Lost</h3>
				<div class="tournament-lost-background">
					<div class="tournament-match-content">
						<div class="bracket-btn">
							<img id="bracket-icon" src="../../../../assets/bracket_icon.svg" alt="bracket_icon">
						</div>
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>You finished in<span>${this.formatCurrentStage(this.stage)}</span> stage!</p>
						<p>Better luck next time!</p>
						<div class="countdown-container">
							<button type="button" class="tournament-lost-leave-btn">Leave</button>
							<p class="tournament-lost-countdown">Leaving automatically in <span>59</span>s</p>
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

	addEventListeners() {
		const bracketBtn = this.querySelector('#bracket-icon');
		const leaveBtn = this.querySelector('.tournament-lost-leave-btn');

		bracketBtn.addEventListener('click', async () => {
			console.log('clicked on bracket')
			try {
				let res = await sendRequest('GET', '/api/tournament/get_bracket/', null, false);
				this.bracketObj = BracketObj.create(res.bracket, res.bracket.tournament_size);
				console.log('bracketObj', this.bracketObj);
				this.redirectToBracket();
			} catch (error) {
				console.log('Error retrieving bracket')
			}
		})
		
		leaveBtn.addEventListener('click', () => {
			localStorage.removeItem("tournamentData")
			const payload = {
				'type': 'leave_tournament',
				'tournament_id': this.tournamentId,
				'from_match': true,
			};

			tournamentSocket.send(JSON.stringify(payload))
			redirectToTournamentHome()
		})
	}

	async redirectToBracket() {
		const gameComponent = document.querySelector('game-component');
		const bracketState = gameComponent.states['bracket'];
		const bracket = new Bracket(this.bracketObj);
	
		bracketState['state'] = bracket;
		gameComponent.changeState(bracketState.state, "/tournamentLost/bracket");
		gameComponent.currentState = "bracket";
	}

	updateCountdownSeconds(time) {
		const secondsSpan = this.querySelector('.tournament-lost-countdown span');

		if (!secondsSpan) return;

		secondsSpan.innerText = time;
	}
}

customElements.define('tournament-lost', TournamentLostElement);
