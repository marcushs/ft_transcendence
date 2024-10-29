export function throwMatchmakingResearchEvent() {
	const event = new CustomEvent('matchmakingResearch', {});
	document.dispatchEvent(event);
}