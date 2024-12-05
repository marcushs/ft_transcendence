import { oauthRedirectCallback } from "../utils/oauthUtils.js";
import {getString} from "../utils/languageManagement.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js";

export default () => {
	const oauthProvider = parseOAuthProvider();
	const html = `
		<h1>Oauth ${oauthProvider} ${getString("oauthRedirect/redirect")}</h1>
		<p id="status">${getString("oauthRedirect/loginProcessing")}</p>
	`;

	setTimeout(() => {
		oauthRedirectCallback(oauthProvider);
	}, 0);

	return html;
}

function parseOAuthProvider() {
	const urlParams = new URLSearchParams(window.location.search);
	const state = urlParams.get('state');
	if (!state) return throwRedirectionEvent('/login');
	const oauthProvider = state.slice(0, state.indexOf('-'));

	return oauthProvider;
}
