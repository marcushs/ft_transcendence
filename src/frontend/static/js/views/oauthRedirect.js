import { oauthRedirectCallback } from "../utils/oauthUtils.js";

export default () => {
	const oauthProvider = parseOAuthProvider();
	const html = `
		<h1>Oauth ${oauthProvider} Redirect...</h1>
		<p id="status">Processing your login...</p>
	`;

	setTimeout(() => {
		oauthRedirectCallback(oauthProvider);
	}, 0);

	return html;
}

function parseOAuthProvider() {
	const urlParams = new URLSearchParams(window.location.search);
	const state = urlParams.get('state');
	const oauthProvider = state.slice(0, state.indexOf('-'));

	return oauthProvider;
}
