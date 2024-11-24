import disableButtonsInGameResearch from "./disableButtonsInGameResearch.js";

export function manageGameStates() {
	const tournamentData = localStorage.getItem("tournamentData");
	const isSearchingPrivateMatch = localStorage.getItem("isSearchingPrivateMatch");
	const isSearchingGame = localStorage.getItem("isSearchingGame");
	const isInGuestState = localStorage.getItem('IsInGuestState');
	const isReadyToPlay = localStorage.getItem("isReadyToPlay");

	if (tournamentData || isSearchingGame || isSearchingPrivateMatch || isInGuestState || isReadyToPlay) {
		disableButtonsInGameResearch();
		const stateContainer = document.querySelector('.states-container');

		if (stateContainer)
			stateContainer.classList.remove('matchmaking-choice');

		if (tournamentData)
			throwChangeGameStateEvent("tournamentHome");
		else
			throwChangeGameStateEvent("onlineHome");
	}
}

function throwChangeGameStateEvent(state) {
	const event = new CustomEvent('changeGameStateEvent', {
		bubbles: true,
		detail: {
			context: state,
		}
	});

	document.dispatchEvent(event);
}