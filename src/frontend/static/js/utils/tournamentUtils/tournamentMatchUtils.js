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
		throwRedirectionEvent('/');
		document.addEventListener('gameComponentLoaded', () => {
			redirectLost(match);
		});
	} else {
		redirectLost(match)
	}
}

function redirectLost(match) {
	const gameComponent = document.querySelector('game-component');
	const tournamentLostState = gameComponent.states['tournamentLost'];
	const tournamentLost = new TournamentLost(match);

	tournamentLostState['state'] = tournamentLost;
	gameComponent.changeState(tournamentLostState.state, tournamentLostState.context);
	gameComponent.currentState = "tournamentLost";
}

export async function setTournamentAlias(gameState) {
	try {
		if (gameState.game_type === 'tournament') {
			const player1_alias = await sendRequest('GET', `/api/tournament/get_alias_by_id/?player_id=${gameState.player_one.id}`, null, false);
			const player2_alias = await sendRequest('GET', `/api/tournament/get_alias_by_id/?player_id=${gameState.player_two.id}`, null, false);
			
			if ('alias' in player1_alias) gameState.player_one.user_infos.username = player1_alias.alias;
			if ('alias' in player2_alias) gameState.player_two.user_infos.username = player2_alias.alias;
		}
	} catch (error) {
		console.error(error.message);
	}
}
