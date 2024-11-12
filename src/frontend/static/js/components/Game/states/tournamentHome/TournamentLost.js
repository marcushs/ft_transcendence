import { getUserId } from "../../../../utils/chatUtils/joinRoomUtils.js";
import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import { displayChatroomComponent } from "../../../../utils/chatUtils/sendMessageCallback.js";
import { putMessageToChatroomConversation } from "../../../../utils/chatUtils/sendPrivateMessage.js";

export default class TournamentLost {
	constructor(tournamentBracket, lostMatch) {
		this.redirectState = "tournament-lost";
		this.class = "tournament-lost";
		let tournamentBracketJsonString = JSON.stringify(tournamentBracket);
		this.tournamentBracket = tournamentBracketJsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
		this.lostMatch = lostMatch;
	}

	render() {
		return `<tournament-lost data-tournament-bracket="${this.tournamentBracket} data-match="${this.lostMatch}""></tournament-lost>`;
	}
}

class TournamentLostElement extends HTMLElement {
	constructor() {
		super();
		this.tournamentBracket = JSON.parse(this.getAttribute('data-tournament-bracket'));
		this.lostMatch = this.getAttribute('data-match');
		this.tournamentId = this.tournamentBracket.tournament.tournament_id;
		this.tournamentName = this.tournamentBracket.tournament.tournament_name;
		this.bracketObj = {
			nbOfPlayers: this.tournamentSize,
			eighthFinal: {},
			quarterFinal: {},
			semiFinal: {},
			final: [],
		};
		this.stageMapping = {
			'eighth_finals': {target: this.bracketObj.eighthFinal, length: 4},
			'quarter_finals': {target: this.bracketObj.quarterFinal, length: 2},
			'semi_finals': {target: this.bracketObj.semiFinal, length: 1},
			'finals': {target: this.bracketObj.final},
		}
		this.stage = this.tournamentBracket.tournament.current_stage;
		this.matches = this.tournamentBracket[this.stage];
		this.clientMatch = null;
		this.userId = null;
	}

	async connectedCallback() {
		await this.findMatch();
		await this.render();
		this.addEventListeners();
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
						<p>You finished in <span>${this.formatCurrentStage(this.stage)}</span> stage!</p>
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

	addEventListeners() {
		const bracketBtn = this.querySelector('#bracket-icon');
		const readyBtn = this.querySelector('.tournament-match-ready-btn');

		bracketBtn.addEventListener('click', () => {
			console.log('clicked on bracket')
			this.makeBracketObject();
			console.log('bracketObj', this.bracketObj);
			this.redirectToBracket();
		})

		readyBtn.addEventListener('click', () => {
			console.log('ready clicked');
			console.log('userId: ', this.userId);
			const payload = {
				'type': 'user_ready_for_match',
				'userId': this.userId,
				'matchId': this.clientMatch.match_id
			}
			tournamentSocket.send(JSON.stringify(payload));
			clearInterval(this.intervalId);
		})
	}

	makeBracketObject() {
		const eighthFinalsMatches = this.tournamentBracket.eighth_finals;
		const quarterFinalsMatches = this.tournamentBracket.quarter_finals;
		const semiFinalsMatches = this.tournamentBracket.semi_finals;
		const finalsMatches = this.tournamentBracket.finals;

		(eighthFinalsMatches.length === 0) ? this.fillNullMatches('eighth_finals') : this.fillBracketMatches('eighth_finals',eighthFinalsMatches);
		(quarterFinalsMatches.length === 0) ? this.fillNullMatches('quarter_finals') : this.fillBracketMatches('quarter_finals', quarterFinalsMatches);
		(semiFinalsMatches.length === 0) ? this.fillNullMatches('semi_finals') : this.fillBracketMatches('semi_finals', semiFinalsMatches);
		(finalsMatches.length === 0) ? this.fillNullMatches('finals') : this.fillBracketMatches('finals', finalsMatches);
	}

	fillBracketMatches(stage, stageMatches) {
		let target = this.stageMapping[stage].target;

		if (stage === 'finals') {
			target = []
			
			target.push([
				{name: stageMatches.players[0].username, score: '0'},
				{name: stageMatches.players[1].username, score: '0'}
			])
			return ;
		}

		target['leftMatches'] = [];
		target['rightMatches'] = [];

		stageMatches.forEach((match, idx) => {
			if (idx % 2 === 0) {
				target.leftMatches.push(this.makeMatch(match))
			} else {
				target.rightMatches.push(this.makeMatch(match))
			}
		});
	}

	fillNullMatches(stage) {
		let target = this.stageMapping[stage].target;
		const length = this.stageMapping[stage].length;

		if (stage === 'finals') {
			target.push(this.nullMatch());
			return ;
		}
		target['leftMatches'] = Array.from({ length: length }, () => this.nullMatch());
		target['rightMatches'] = Array.from({ length: length }, () => this.nullMatch());
	}

	nullMatch() {
		return [null, null];
	}

	makeMatch(match) {
		match = [
			{name: match.players[0].username, score: '0'}, 
			{name: match.players[1].username, score: '0'}
		];
		return match;
	}

	redirectToBracket() {
		const gameComponent = document.querySelector('game-component');
		const bracketState = gameComponent.states['bracket'];
		const bracket = new Bracket(this.bracketObj);
	
		bracketState['state'] = bracket;
		gameComponent.changeState(bracketState.state, bracketState.context);
		gameComponent.currentState = "bracket";
	}

	updateCountdownSeconds(time) {
		const secondsSpan = this.querySelector('.match-countdown span');

		if (!secondsSpan) return;

		secondsSpan.innerText = time;
	}
}

customElements.define('tournament-lost', TournamentLostElement);
