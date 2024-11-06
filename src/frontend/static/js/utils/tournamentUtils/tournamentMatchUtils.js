import TournamentMatch from "../../components/Game/states/tournamentHome/TournamentMatch.js";

export function redirectToTournamentWaitingRoom(tournamentData) {
	const gameComponent = document.querySelector('game-component');
	const tournamentMatchState = gameComponent.states['tournamentMatch'];
	const tournamentMatch = new TournamentMatch(tournamentData);

	tournamentMatchState['state'] = tournamentMatch;
	gameComponent.changeState(tournamentMatchState.state, tournamentMatchState.context);
}
