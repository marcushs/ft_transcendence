export function throwRedirectionEvent (redirectionRoute) {
	const event = new CustomEvent('redirection', {
		bubbles: true,
		detail: {
			route: redirectionRoute
		}
	});

	document.dispatchEvent(event);
}