import { TournamentComponent } from "../../components/Game/states/tournamentHome/TournamentComponent.js";

export function putNewTournamentToDOM(tournament) {
	const tournamentsList = document.querySelector('.tournaments-list');

	if (!tournamentsList) return ;
	
	const tournamentEl = new TournamentComponent(tournament);

	tournamentsList.appendChild(tournamentEl);
}
