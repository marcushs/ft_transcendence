import checkAuthentication from "./checkAuthentication.js";
import getUsernameById from "./getUsernameById.js";
import {sendRequest} from "./sendRequest.js";
import { startTournamentMatchInstance } from "./tournamentUtils/tournamentMatchUtils.js";

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
		if (data.state === 'inGame')
			await startTournamentMatchInstance()
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
		} else if (data.in_private_lobby) {
			if (data.opponent_id === data.user_id && data.opponent_state === "ready" && !isInGuestState) {
				const username = await getUsernameById(data.user_id);

				localStorage.setItem('isInGuestState', username);
			} else if (data.opponent_id !== data.user_id && data.opponent_state === "waiting" && !isSearchingPrivateMatch) {
				const username = await getUsernameById(data.opponent_id);

				localStorage.setItem('isSearchingPrivateMatch', username);
			} else if (data.opponent_id !== data.user_id && data.opponent_state === "ready" && !isReadyToPlay) {
				const username = await getUsernameById(data.opponent_id);

				localStorage.setItem('isSearchingPrivateMatch', username);
				localStorage.setItem('isReadyToPlay', true);
			}
		}
	} catch (e) {
		localStorage.removeItem('isSearchingPrivateMatch');
		localStorage.removeItem('IsInGuestState');
		localStorage.removeItem('isReadyToPlay');
	}
}
