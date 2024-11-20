import { TournamentComponent } from "../../components/Game/states/tournamentHome/TournamentComponent.js";
import TournamentWaitingRoom from "../../components/Game/states/tournamentHome/TournamentWaitingRoom.js";
import TournamentWon from "../../components/Game/states/tournamentHome/TournamentWon.js";
import resetButtonsOnMatchmakingCanceled from "../resetButtonsOnMatchmakingCanceled.js";
import disableButtonsInGameResearch from "../disableButtonsInGameResearch.js";

export function putNewTournamentToDOM(tournament) {
	const tournamentsList = document.querySelector('.tournaments-list');

	if (!tournamentsList) return ;
	
	const tournamentEl = new TournamentComponent(tournament);

	tournamentsList.appendChild(tournamentEl);
}

export function redirectToTournamentWaitingRoom(tournamentData) {
	disableButtonsInGameResearch();
	const gameComponent = document.querySelector('game-component');
	const tournamentWaitingRoomState = gameComponent.states['waitingRoom'];
	const tournamentWaitingRoom = new TournamentWaitingRoom(tournamentData);

	tournamentWaitingRoomState['state'] = tournamentWaitingRoom;
	gameComponent.changeState(tournamentWaitingRoomState.state, tournamentWaitingRoomState.context);
	gameComponent.currentState = "waitingRoom";
}

export function redirectToWinnerPage(tournamentBracket) {
	if (location.pathname !== '/') {
		throwRedirectionEvent('/');
		document.addEventListener('gameComponentLoaded', () => {
			redirectWon(tournamentBracket);
		});
	} else {
		console.log('got in else block in redirectToTournamentMatch')
		redirectWon(tournamentBracket)
	}
}

function redirectWon(tournamentBracket) {
	const gameComponent = document.querySelector('game-component');
	const tournamentWonState = gameComponent.states['tournamentWon'];
	const tournamentWon = new TournamentWon(tournamentBracket);

	tournamentWonState['state'] = tournamentWon;
	gameComponent.changeState(tournamentWonState.state, tournamentWonState.context);
	gameComponent.currentState = "tournamentWon";
}

export function redirectToTournamentHome() {
	// const gameComponent = document.querySelector('game-component');
	// const tournamentHomeState = gameComponent.states['tournamentHome'];
	//
	// gameComponent.changeState(tournamentHomeState.state, tournamentHomeState.context);
	// gameComponent.currentState = "tournamentHome";
	document.querySelector('game-top-bar').className = "";
	resetButtonsOnMatchmakingCanceled();
	throwChangeGameStateEvent();
}

function throwChangeGameStateEvent() {
	const event = new CustomEvent('changeGameStateEvent', {
		bubbles: true,
		detail: {
			context: "tournamentHome",
		}
	});

	document.dispatchEvent(event);
}

export function updateTournamentInfo(tournamentData) {
	const joinedTournamentId = tournamentData.tournament_id;
	const waitingRoom = document.querySelector('.waiting-room');
	const joinComponent = document.querySelector('join-component');
	
	if (waitingRoom && (waitingRoom.getAttribute('data-tournament') === joinedTournamentId)) {
		console.log('updateWaitingRoomPlayerCount')
		updateWaitingRoomPlayerCount(tournamentData);
	} else if (joinComponent) {
		console.log('updateTournamentComponentPlayerCount')
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
			
			if (tournamentData.member_count === tournamentData.tournament_size) tournament.remove();
		}
	});
}

