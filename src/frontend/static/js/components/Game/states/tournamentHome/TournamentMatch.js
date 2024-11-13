import { getUserId } from "../../../../utils/chatUtils/joinRoomUtils.js";
import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import { displayChatroomComponent } from "../../../../utils/chatUtils/sendMessageCallback.js";
import { putMessageToChatroomConversation } from "../../../../utils/chatUtils/sendPrivateMessage.js";
import BracketObj from "./bracket/BracketObj.js";

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
		this.tournamentBracket = JSON.parse(this.getAttribute('data-tournament-match'));
		this.tournamentId = this.tournamentBracket.tournament.tournament_id;
		this.tournamentName = this.tournamentBracket.tournament.tournament_name;
		this.tournamentSize = this.tournamentBracket.tournament.tournament_size;
		this.bracketObj = BracketObj.create(this.tournamentBracket, this.tournamentSize);
		this.stage = this.tournamentBracket.tournament.current_stage;
		this.matches = this.tournamentBracket[this.stage];
		this.clientMatch = null;
		this.userId = null;
	}

	async connectedCallback() {
		await this.findMatch();
		await this.render();
		this.addEventListeners();
		this.showMatchMessage();
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
							<p class="match-countdown">Match starts in <span></span>s</p>
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

	showMatchMessage() {
		const botData = {
			id: 'tournament_bot',
			username: 'Tournament Bot',
			profile_image_link: 'https://img.freepik.com/vecteurs-libre/chatbot-est-vecteur-message_78370-4104.jpg'
		}

		const matchMessage = {
			chatroom: 'tournament_match',
			author: botData,
			message: `${this.formatCurrentStage(this.stage)} match against ${this.getOpponent()} will start soon!
			Click the "Ready" button when ready! GLHF!`,
			created: new Date(),
		}

		displayChatroomComponent(botData);
		putMessageToChatroomConversation(matchMessage);
	}
}

customElements.define('tournament-match', TournamentMatchElement);
