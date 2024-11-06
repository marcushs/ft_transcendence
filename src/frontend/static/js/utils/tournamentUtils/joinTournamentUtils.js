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
	const joinedTournamentId = tournamentData.tournament_id;
	const waitingRoom = document.querySelector('.waiting-room');
	const joinComponent = document.querySelector('join-component');
	
	if (waitingRoom && (waitingRoom.getAttribute('data-tournament') === joinedTournamentId)) {
		const joinedPlayersSpan = document.getElementById('tournament-waiting-room-joined-players');
		
		joinedPlayersSpan.innerText = `${tournamentData.member_count} / ${tournamentData.tournament_size}`
	} else if (joinComponent) {
		const joinableTournaments = joinComponent.querySelectorAll('tournament-component');

		joinableTournaments.forEach(tournament => {
			if (tournament.tournamentId === joinedTournamentId) {
				const joinedPlayers = tournament.querySelector('.tournament-right-infos > p');

				joinedPlayers.innerText = `${tournamentData.member_count} / ${tournamentData.tournament_size}`; 
				redirectToTournamentWaitingRoom(tournamentData);
			}
		})
	}
}
