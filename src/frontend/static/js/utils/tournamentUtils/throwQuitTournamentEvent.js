export function throwQuitTournamentEvent() {
	const event = new CustomEvent('quitTournament', {});
	document.dispatchEvent(event);
}
