export function throwGameInactivityEvent(userId) {
	const event = new CustomEvent('inactiveGame', {
		detail: {
			userId: userId,
		},
	});
	document.dispatchEvent(event);
}