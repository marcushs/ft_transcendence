import { oauthRedirectCallback } from "../utils/oauthUtils.js";

export default () => {
	const html = `
		<h1>Oauth Redirect...</h1>
		<p id="status">Processing your login...</p>
	`;

	setTimeout(oauthRedirectCallback, 0);

	return html;
}
