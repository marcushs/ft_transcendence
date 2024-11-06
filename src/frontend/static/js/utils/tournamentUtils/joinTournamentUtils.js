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
	const tournamentWaitingRoom = new TournamentWaitingRoom(tournamentData);

	tournamentWaitingRoomState['state'] = tournamentWaitingRoom;
	gameComponent.changeState(tournamentWaitingRoomState.state, tournamentWaitingRoomState.context);
	gameComponent.currentState = "tournamentWaitingRoom";
}

export function updateTournamentInfo(tournamentData) {
	const joinedTournamentId = tournamentData.tournament_id;
	const waitingRoom = document.querySelector('.waiting-room');
	const joinComponent = document.querySelector('join-component');
	
	if (waitingRoom && (waitingRoom.getAttribute('data-tournament') === joinedTournamentId)) {
		updateWaitingRoomPlayerCount(tournamentData);
	} else if (joinComponent) {
		updateTournamentComponentPlayerCount(tournamentData, joinComponent, joinedTournamentId);
	}
}

function updateWaitingRoomPlayerCount(tournamentData) {
	const joinedPlayersSpan = document.getElementById('tournament-waiting-room-joined-players');
		
	joinedPlayersSpan.innerText = `${tournamentData.member_count} / ${tournamentData.tournament_size}`
}

function updateTournamentComponentPlayerCount(tournamentData, joinComponent, joinedTournamentId) {
	const joinableTournaments = joinComponent.querySelectorAll('tournament-component');

	joinableTournaments.forEach(tournament => {
		if (tournament.tournamentId === joinedTournamentId) {
			const joinedPlayers = tournament.querySelector('.tournament-right-infos > p');

			joinedPlayers.innerText = `${tournamentData.member_count} / ${tournamentData.tournament_size}`; 
		}
	})
}
