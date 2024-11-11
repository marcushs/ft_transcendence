import TournamentMatch from "../../components/Game/states/tournamentHome/TournamentMatch.js";

export function redirectToTournamentMatch(tournamentBracket) {
	const gameComponent = document.querySelector('game-component');
	const tournamentMatchState = gameComponent.states['tournamentMatch'];
	const tournamentMatch = new TournamentMatch(tournamentBracket);

	tournamentMatchState['state'] = tournamentMatch;
	gameComponent.changeState(tournamentMatchState.state, tournamentMatchState.context);
	gameComponent.currentState = "tournamentMatch";
}

// export function stopTournamentMatchCountdown(matchId) {
// 	const tournamentMatch = document.querySelector('tournament-match');
// 	const matchData = JSON.parse(tournamentMatch.getAttribute('data-tournament-match')).
// }
