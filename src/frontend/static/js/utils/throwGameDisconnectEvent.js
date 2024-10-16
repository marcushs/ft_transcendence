export function throwGameDisconnectEvent(userId) {
	const event = new CustomEvent('gameDisconnect', {
		detail: {
			userId: userId,
		},
	});
	document.dispatchEvent(event);
}