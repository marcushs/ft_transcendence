export function throwGameInactivityEvent() {
	const event = new CustomEvent('inactiveGame', {});
	document.dispatchEvent(event);
}