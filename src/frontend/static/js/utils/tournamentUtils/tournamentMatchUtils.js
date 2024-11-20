import TournamentMatch from "../../components/Game/states/tournamentHome/TournamentMatch.js";
import { sendRequest } from "../sendRequest.js";
import { gameWebsocket, gameSocket } from "../../components/Game/states/inGame/gameWebsocket.js";
import getUserId from "../getUserId.js";
import TournamentLost from "../../components/Game/states/tournamentHome/TournamentLost.js";
import { tournamentSocket } from "../../views/websocket/loadWebSocket.js";
import {throwRedirectionEvent} from "../throwRedirectionEvent.js";

export function redirectToTournamentMatch(tournamentBracket) {
	if (location.pathname !== '/') {
		throwRedirectionEvent('/');
		document.addEventListener('gameComponentLoaded', () => {
			redirectMatch(tournamentBracket);
		});
	} else {
		redirectMatch(tournamentBracket)
	}
}

function redirectMatch(tournamentBracket) {
	const gameComponent = document.querySelector('game-component');
	const tournamentMatchState = gameComponent.states['tournamentMatch'];
	const tournamentMatch = new TournamentMatch(tournamentBracket);

	tournamentMatchState['state'] = tournamentMatch;
	gameComponent.changeState(tournamentMatchState.state, tournamentMatchState.context);
	gameComponent.currentState = "tournamentMatch";
}

export async function startTournamentMatchInstance() {
	const userId = await getUserId();

	if (!userId) return console.error('Cannot find userId');
	gameWebsocket(userId);
}

export async function redirectToTournamentLostMatch(match) {
	if (location.pathname !== '/') {
		alert('wtf')
		throwRedirectionEvent('/');
		document.addEventListener('gameComponentLoaded', () => {
			redirectLost(match);
		});
	} else {
		redirectLost(match)
	}
}

function redirectLost(match) {
	// alert('redirect lost')
	// const gameComponent = document.querySelector('game-component');
	// const tournamentLostState = gameComponent.states['tournamentLost'];
	// const tournamentLost = new TournamentLost(match);

	// tournamentLostState['state'] = tournamentLost;
	// gameComponent.changeState(tournamentLostState.state, tournamentLostState.context);
	// gameComponent.currentState = "tournamentLost";
}
