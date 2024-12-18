import { getUserId } from "../../../../utils/chatUtils/joinRoomUtils.js";
import Bracket from "./bracket/bracket.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";
import { displayChatroomComponent } from "../../../../utils/chatUtils/sendMessageCallback.js";
import { putMessageToChatroomConversation } from "../../../../utils/chatUtils/sendPrivateMessage.js";
import BracketObj from "./bracket/BracketObj.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import {getString} from "../../../../utils/languageManagement.js";

export default class TournamentMatch {
	constructor(match) {
		this.redirectState = "tournament-match";
		this.class = "tournament-match";
		let jsonString = JSON.stringify(match);
		this.match = jsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
	}

	render() {
		return `<tournament-match data-tournament-match="${this.match}"></tournament-match>`;
	}
}

class TournamentMatchElement extends HTMLElement {
	constructor() {
		super();
		this.match = JSON.parse(this.getAttribute('data-tournament-match'));
		this.tournamentId = this.match.tournament_id;
		this.tournamentName = this.match.tournament_name;
		this.bracketObj = null;
		this.stage = this.match.tournament_round;
		this.userId = null;
		this.toBeDeter = false;
	}

	async connectedCallback() {
		await this.render();
		this.addEventListeners();
		this.setOpponentSpanActive();
		this.showMatchMessage();
	}

	async render() {
		const opponent = await this.getOpponent();
		this.innerHTML = `
			<div class="tournament-match" data-tournament="${this.tournamentId}">
				<h3 class="tournament-match-title">${getString('tournament/waitingRoom')}</h3>
				<div class="tournament-match-background">
					<div class="tournament-match-content">
						<div class="bracket-btn">
							<img id="bracket-icon" src="../../../../assets/bracket_icon.svg" alt="bracket_icon">
						</div>
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>${getString('tournament/stage')}: <span>${this.formatCurrentStage(this.stage)}</span></p>
						<p>${getString('tournament/opponent')}: <span id='opponent-span'>${opponent}</span></p>
						<div class="countdown-container">
							<button type="button" class="tournament-match-ready-btn ${this.toBeDeter ? 'clicked' : ''}">${getString('buttonComponent/ready')}</button>
							<p class="match-countdown">${getString('tournament/matchStart')} <span></span>${getString('tournament/second')}</p>
						</div>
					</div>
				</div>
			</div>
		`;	
	}

	formatCurrentStage(round) {
		if (round === 'eighth_finals') return getString('tournament/Eighth-finals');

		round = round.replace('_', '-');
		round = round[0].toUpperCase() + round.slice(1);
		return getString(`tournament/${round}`)
	}

	async getOpponent() {
		this.userId = await getUserId();
		
		if (!this.userId) return console.error('Cannot find userId');

		if (this.match.players.length === 2)
			return this.match.players[0].id === this.userId ? this.match.players[1].alias : this.match.players[0].alias;
		this.toBeDeter = true;
		return getString('tournament/toBeDeter');
	}

	addEventListeners() {
		const bracketBtn = this.querySelector('#bracket-icon');
		const readyBtn = this.querySelector('.tournament-match-ready-btn');

		bracketBtn.addEventListener('click', async () => {
			try {
				let res = await sendRequest('GET', '/api/tournament/get_bracket/', null, false);
				this.bracketObj = BracketObj.create(res.bracket, res.bracket.tournament_size);
				this.redirectToBracket();
			} catch (error) {
				console.error('Error retrieving bracket')
			}
		})

		readyBtn.addEventListener('click', () => {
			readyBtn.disabled = true;
			readyBtn.classList.add('clicked')
			const payload = {
				'type': 'user_ready_for_match',
				'userId': this.userId,
				'matchId': this.match.match_id
			}
			tournamentSocket.send(JSON.stringify(payload));
		})
	}

	async redirectToBracket() {
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

	async showMatchMessage() {
		const opponentSpan = this.querySelector("#opponent-span");
		const matchCountdown = this.querySelector('.match-countdown');

		if (this.toBeDeter) {
			matchCountdown.remove();
			return;
		}

		const botData = {
			id: 'tournament_bot',
			username: getString("chatComponent/tournamentBot"),
			isBot: true,
			profile_image_link: 'https://img.freepik.com/vecteurs-libre/chatbot-est-vecteur-message_78370-4104.jpg'
		}

		const matchMessage = {
			chatroom: 'tournament_match',
			author: botData,
			message: `${getString(`chatComponent/${this.stage}`)} ${getString(`chatComponent/tournamentBotSentencePrefix`)} ${await this.getOpponent()} ${getString("chatComponent/tournamentBotSentenceSuffix")}`,
			created: new Date(),
		}


		displayChatroomComponent(botData);
		putMessageToChatroomConversation(matchMessage);
	}

	setOpponentSpanActive() {
		const opponentSpan = this.querySelector("#opponent-span");

		if (this.toBeDeter) {
			opponentSpan.classList.add('active'); 
		}
	}
}

customElements.define('tournament-match', TournamentMatchElement);
