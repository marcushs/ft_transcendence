import '../../../ButtonComponent.js';
import './JoinComponent.js';
import './CreateComponent.js'
import {getString} from "../../../../utils/languageManagement.js";
import TournamentWaitingRoom from "./TournamentWaitingRoom.js";
import TournamentMatch from "./TournamentMatch.js";

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
			return this.generateWaitingRoomState(tournamentData);
		} else if (tournamentData && tournamentData.state === "matchState") {
			console.log(tournamentData)
			return this.generateMatchState(tournamentData);
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
		const tournamentWaitingRoom = new TournamentWaitingRoom(tournamentData.tournamentData);
		const tournamentWaitingRoomState = gameComponent.states['tournamentWaitingRoom'];

		tournamentWaitingRoomState['state'] = tournamentWaitingRoom;
		gameComponent.currentState = "tournamentWaitingRoom";
		return tournamentWaitingRoom.render();
	}

	generateMatchState(matchData) {
		const gameComponent = document.querySelector('game-component');
		const tournamentMatchState = gameComponent.states['tournamentMatch'];
		const tournamentMatch = new TournamentMatch(matchData.matchData);

		tournamentMatchState['state'] = tournamentMatch;
		gameComponent.currentState = "tournamentMatch";
		return tournamentMatch.render();
	}
}

export default tournamentHome;
