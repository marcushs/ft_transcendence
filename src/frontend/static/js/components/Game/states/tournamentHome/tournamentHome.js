import '../../../ButtonComponent.js';
import './JoinComponent.js';
import './CreateComponent.js'
import {getString} from "../../../../utils/languageManagement.js";
import TournamentWaitingRoom from "./TournamentWaitingRoom.js";
import TournamentMatch from "./TournamentMatch.js";
import TournamentLost from './TournamentLost.js';
import TournamentWon from './TournamentWon.js';

class tournamentHome {

	constructor() {
		this.redirectState = "tournament-home";
		this.class = "tournament-home";
	}

	render() {
		let tournamentData = localStorage.getItem("tournamentData");

		try {
			tournamentData = JSON.parse(tournamentData);
		} catch {}
		
		if (tournamentData && tournamentData.state === "waitingRoom") {
			return `
				<div class="tournament-home-container">
					<h3>${getString('gameComponent/tournaments')}</h3>
					<div class="tournament-components-container">
						${this.generateWaitingRoomState(tournamentData)}
					</div>
				</div>
			`;
			// return this.generateWaitingRoomState(tournamentData);
		} else if (tournamentData && tournamentData.state === "matchState") {
			return `
				<div class="tournament-home-container">
					<h3>${getString('gameComponent/tournaments')}</h3>
					<div class="tournament-components-container">
						${this.generateMatchState(tournamentData)}
					</div>
				</div>
			`;
			// return this.generateMatchState(tournamentData);
		} else if (tournamentData && tournamentData.state === "tournamentLost") {
			return `
				<div class="tournament-home-container">
					<h3>${getString('gameComponent/tournaments')}</h3>
					<div class="tournament-components-container">
						${this.generateTournamentLostState(tournamentData)}
					</div>
				</div>
			`;
			// return this.generateTournamentLostState(tournamentData);
		} else if (tournamentData && tournamentData.state === "tournamentWon") {
			return `
				<div class="tournament-home-container">
					<h3>${getString('gameComponent/tournaments')}</h3>
					<div class="tournament-components-container">
						${this.generateTournamentWonState(tournamentData.tournamentData)}
					</div>
				</div>
			`;
			// return this.generateTournamentWonState(tournamentData.tournamentData);
		} else {
			return `
				<div class="tournament-home-container">
					<h3>${getString('gameComponent/tournaments')}</h3>
					<div class="tournament-components-container">
						<create-component></create-component>
						<join-component></join-component>
					</div>
				</div>
			`;
		}
	}

	generateWaitingRoomState(tournamentData) {
		const gameComponent = document.querySelector('game-component');
		const tournamentWaitingRoomState = (gameComponent) ? gameComponent.states['waitingRoom'] : "";
		const tournamentWaitingRoom = new TournamentWaitingRoom(tournamentData.tournamentData);

		if (tournamentWaitingRoomState)
			tournamentWaitingRoomState['state'] = tournamentWaitingRoom;
		if (gameComponent)
			gameComponent.currentState = "waitingRoom";
		return tournamentWaitingRoom.render();
	}

	generateMatchState(matchData) {
		const gameComponent = document.querySelector('game-component');
		const tournamentMatchState = (gameComponent) ? gameComponent.states['tournamentMatch'] : "";
		const tournamentMatch = new TournamentMatch(matchData.matchData);

		if (tournamentMatchState)
			tournamentMatchState['state'] = tournamentMatch;
		if (gameComponent)
			gameComponent.currentState = "tournamentMatch";
		return tournamentMatch.render();
	}

	generateTournamentLostState(matchData) {
		const gameComponent = document.querySelector('game-component');
		const tournamentLostState = (gameComponent) ? gameComponent.states['tournamentLost'] : "";
		const tournamentLost = new TournamentLost(matchData.matchData);

		if (tournamentLostState)
			tournamentLostState['state'] = tournamentLost;
		if (gameComponent)
			gameComponent.currentState = "tournamentLost";
		return tournamentLost.render();
	}

	generateTournamentWonState(tournamentBracket) {
		const gameComponent = document.querySelector('game-component');
		const tournamentWonState = (gameComponent) ? gameComponent.states['tournamentWon'] : "";
		const tournamentWon = new TournamentWon(tournamentBracket);

		if (tournamentWonState)
			tournamentWonState['state'] = tournamentWon;
		if (gameComponent) {
			gameComponent.changeState(tournamentWonState.state, tournamentWonState.context);
			gameComponent.currentState = "tournamentWon";
		}
		return tournamentWon.render();
	}
}

export default tournamentHome;
