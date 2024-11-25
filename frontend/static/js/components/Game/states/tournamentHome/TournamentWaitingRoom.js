import { getString } from "../../../../utils/languageManagement.js";
import { tournamentSocket } from "../../../../views/websocket/loadWebSocket.js";

export default class TournamentWaitingRoom {
	constructor(tournamentData) {
		this.redirectState = "tournament-waiting-room";
		this.class = "tournament-waiting-room";
		let jsonString = JSON.stringify(tournamentData);
		this.tournamentData = jsonString.replace(/&/g, '&amp;')
										.replace(/'/g, '&apos;')
										.replace(/"/g, '&quot;')
										.replace(/</g, '&lt;')
										.replace(/>/g, '&gt;');
	
	}

	render() {
		return `<tournament-waiting-room data-tournament="${this.tournamentData}"></tournament-waiting-room>`;
	}
}

class TournamentWaitingRoomElement extends HTMLElement {
	constructor() {
		super();
		const tournamentData = JSON.parse(this.getAttribute('data-tournament'));

		this.tournamentId = tournamentData.tournament_id;
		this.tournamentName = tournamentData.tournament_name;
		this.tournamentSize = tournamentData.tournament_size;
		this.tournamentCreator = tournamentData.creator.alias;
		console.log('alias is: ', this.tournamentCreator)
		console.log(tournamentData)
		this.tournamentMemberCount = tournamentData.member_count;
	}

	connectedCallback() {
		this.render();
		this.addEventListeners();
	}

	render() {
		this.innerHTML = `
			<div class="waiting-room" data-tournament="${this.tournamentId}">
				<h3 class="waiting-room-title">${getString('tournament/waitingRoom')}</h3>
				<div class="waiting-room-background">
					<div class="waiting-room-content">
						<h4 class="tournament-name">${this.tournamentName}</h4>
						<p>${getString('tournament/creator')}: <span>${this.tournamentCreator}</span></p>
						<p>${getString('tournament/joinedPlayers')}: <span id="tournament-waiting-room-joined-players">${this.tournamentMemberCount} / ${this.tournamentSize}</span></p>
						<button type="button" class="leave-tournament-button">${getString('buttonComponent/leave')}</button>
					</div>
				</div>
			</div>
		`;
	}

	addEventListeners() {
		const leaveBtn = this.querySelector('.leave-tournament-button');

		leaveBtn.addEventListener('click', () => {
			localStorage.removeItem("tournamentData");
			const payload = {
				'type': 'leave_tournament',
				'tournament_id': this.tournamentId,
				'from_match': false
			};

			tournamentSocket.send(JSON.stringify(payload))
		})
	}
}

customElements.define('tournament-waiting-room', TournamentWaitingRoomElement);
