import TournamentMatch from "../../components/Game/states/tournamentHome/TournamentMatch.js";
import { sendRequest } from "../sendRequest.js";
import { gameWebsocket, gameSocket } from "../../components/Game/states/inGame/gameWebsocket.js";
import getUserId from "../getUserId.js";
import TournamentLost from "../../components/Game/states/tournamentHome/TournamentLost.js";
import { tournamentSocket } from "../../views/websocket/loadWebSocket.js";

export function redirectToTournamentMatch(tournamentBracket) {
	const gameComponent = document.querySelector('game-component');
	const tournamentMatchState = gameComponent.states['tournamentMatch'];
	const tournamentMatch = new TournamentMatch(tournamentBracket);

	tournamentMatchState['state'] = tournamentMatch;
	gameComponent.changeState(tournamentMatchState.state, tournamentMatchState.context);
	gameComponent.currentState = "tournamentMatch";
}

export async function startTournamentMatchInstance() {
	const userId = await getUserId();

	gameWebsocket(userId);
}

export function proceedInTournament(gameId, userId) {
	const payload = {
		'type': 'proceed_tournament',
		'user_id': userId,
		'match_id': gameId
	}
	tournamentSocket.send(JSON.stringify(payload));
}

export async function redirectToTournamentLostMatch(matchId) {
	try {
		const res = await sendRequest('GET', `/api/tournament/get_bracket/?match_id=${matchId}`, null, false);
	
		const tournamentBracket = res.bracket;
		const gameComponent = document.querySelector('game-component');
		const tournamentLostState = gameComponent.states['tournamentLost'];
		const tournamentLost = new TournamentLost(tournamentBracket, matchId);
	
		tournamentLostState['state'] = tournamentLost;
		gameComponent.changeState(tournamentLostState.state, tournamentLostState.context);
		gameComponent.currentState = "tournamentLost";
	} catch (error) {
		
	}
}
