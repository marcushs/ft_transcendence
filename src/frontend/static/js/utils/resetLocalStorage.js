import checkAuthentication from "./checkAuthentication.js";
import {sendRequest} from "./sendRequest.js";

export async function resetLocalStorage() {
	const isConnected = await checkAuthentication();

	if (isConnected) {
		await resetTournamentData();
		await resetPrivateMatch();
	} else {
		localStorage.removeItem('tournamentData');
		localStorage.removeItem('isSearchingPrivateMatch');
		localStorage.removeItem('IsInGuestState');
		localStorage.removeItem('isReadyToPlay');
	}
}

async function resetTournamentData() {
	const tournamentData = localStorage.getItem('tournamentData');

	try {
		const data = await sendRequest("GET", "/api/tournament/get_tournament_state/", null);

		if (tournamentData && !data.isInTournament)
			localStorage.removeItem('tournamentData');
		if (!tournamentData && data.isInTournament)
			localStorage.setItem('tournamentData', JSON.stringify(data));
		if (tournamentData && data.isInTournament && data.state !== tournamentData.state)
			localStorage.setItem('tournamentData', JSON.stringify(data));
		// if (!data.isInTournament && tournamentData)
		// // if (tournamentData && tournamentData.)
	} catch (e) {
		localStorage.removeItem('tournamentData');
	}
}

async function resetPrivateMatch() {
	const isSearchingPrivateMatch = localStorage.getItem("isSearchingPrivateMatch");
	const isInGuestState = localStorage.getItem('IsInGuestState');
	const isReadyToPlay = localStorage.getItem("isReadyToPlay");

	try {
		const data = await sendRequest("GET", "/api/matchmaking/check_private_match/", null);

		if ((isSearchingPrivateMatch || isInGuestState || isReadyToPlay) && !data.in_private_lobby) {
			localStorage.removeItem('isSearchingPrivateMatch');
			localStorage.removeItem('IsInGuestState');
			localStorage.removeItem('isReadyToPlay');
		}
	} catch (e) {
		localStorage.removeItem('isSearchingPrivateMatch');
		localStorage.removeItem('IsInGuestState');
		localStorage.removeItem('isReadyToPlay');
	}
}