import { getUserId } from "../../../../utils/chatUtils/joinRoomUtils.js";
import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import { displayChatroomComponent } from "../../../../utils/chatUtils/sendMessageCallback.js";
import { putMessageToChatroomConversation } from "../../../../utils/chatUtils/sendPrivateMessage.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import BracketObj from "./bracket/BracketObj.js";
import { redirectToTournamentHome } from "../../../../utils/tournamentUtils/joinTournamentUtils.js";

export default class TournamentLost {
	constructor(tournamentBracket, lostMatch) {
		this.redirectState = "tournament-lost";
		this.class = "tournament-lost";
		let tournamentBracketJsonString = JSON.stringify(tournamentBracket);
		//html encode
		this.tournamentBracket = tournamentBracketJsonString.replace(/&/g, '&amp;')
															.replace(/'/g, '&apos;')
															.replace(/"/g, '&quot;')
															.replace(/</g, '&lt;')
															.replace(/>/g, '&gt;');
		this.lostMatch = lostMatch;
	}

	render() {
		return `<tournament-lost data-tournament-bracket="${this.tournamentBracket}" data-match="${this.lostMatch}"></tournament-lost>`;
	}
}

class TournamentLostElement extends HTMLElement {
	constructor() {
		super();
		this.tournamentBracket = JSON.parse(this.getAttribute('data-tournament-bracket'));
		this.lostMatch = this.getAttribute('data-match');
		this.tournamentId = this.tournamentBracket.tournament.tournament_id;
		this.tournamentName = this.tournamentBracket.tournament.tournament_name;
		this.tournamentSize = this.tournamentBracket.tournament.tournament_size;
		this.bracketObj = BracketObj.create(this.tournamentBracket, this.tournamentSize);
		this.match = null;
		this.stage = null;
		this.clientMatch = null;
		this.userId = null;
		this.intervalId = null;
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
		try {
			let res = await sendRequest('GET', `/api/tournament/get_match_by_id/?match_id=${this.lostMatch}`, null, false);

			console.log(res)

			if (res.match) {
				this.match = res.match;
				this.stage = this.match.tournament_round
			}
		} catch (error) {
			return null;
		}
	}

	addEventListeners() {
		const bracketBtn = this.querySelector('#bracket-icon');
		const leaveBtn = this.querySelector('.tournament-lost-leave-btn');
		const secondsSpan = this.querySelector('.tournament-lost-countdown > span');
		let count = 59;

		
		bracketBtn.addEventListener('click', () => {
			console.log('clicked on bracket')
			console.log('bracketObj', this.bracketObj);
			this.redirectToBracket();
		})
		
		leaveBtn.addEventListener('click', () => {
			redirectToTournamentHome()
			clearInterval(this.intervalId);
		})

		this.intervalId = setInterval(() => {
			secondsSpan.innerText = `${count}`;
			count--;
		}, 1000);
	}

	redirectToBracket() {
		const gameComponent = document.querySelector('game-component');
		const bracketState = gameComponent.states['bracket'];
		const bracket = new Bracket(this.bracketObj);
	
		bracketState['state'] = bracket;
		gameComponent.changeState(bracketState.state, bracketState.context);
		gameComponent.currentState = "bracket";
	}
}

customElements.define('tournament-lost', TournamentLostElement);
