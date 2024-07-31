import { handleOauthCallback } from "../utils/oauthUtils.js";

export default () => {
	const html = `
		<h1>Oauth Redirect...</h1>
		<p id="status">Processing your login...</p>
	`;

	setTimeout(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
	
		if (code && state) {
			handleOauthCallback(code, state);
		} else {
			document.getElementById('status').textContent = 'Error: Invalid request';
			setTimeout(() => window.location.href = '/login', 2000);
		}
	}, 0);

	return html;
}
