import { TournamentComponent } from "../../components/Game/states/tournamentHome/TournamentComponent.js";
import TournamentWaitingRoom from "../../components/Game/states/tournamentHome/TournamentWaitingRoom.js";

export function putNewTournamentToDOM(tournament) {
	const tournamentsList = document.querySelector('.tournaments-list');

	if (!tournamentsList) return ;
	
	const tournamentEl = new TournamentComponent(tournament);

	tournamentsList.appendChild(tournamentEl);
}

export function redirectToTournamentWaitingRoom(tournamentData) {
	const gameComponent = document.querySelector('game-component');
	const tournamentWaitingRoomState = gameComponent.states['tournamentWaitingRoom'];

	gameComponent.changeState(new TournamentWaitingRoom(tournamentData), tournamentWaitingRoomState.context);
}

export function updateTournamentInfo(tournamentData) {
	const waitingRoom = document.querySelector('.waiting-room');
	
	if (waitingRoom) console.log('waitingRoom.tournamentId: ', waitingRoom.tournamentId);
	console.log('tournamentData.tournament_id: ', tournamentData.tournament_id);
	// if (waitingRoom && waitingRoom.tournamentId === tournamentData.tournament_id) {

	// 	return ;
	// }
}
