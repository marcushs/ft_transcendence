import { handleOauthCallback, accessResource } from "../utils/oauthUtils.js";

export default () => {
	const html = `
		<h1>Oauth Redirect...</h1>
		<p id="status">Processing your login...</p>
	`;

	setTimeout(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const status_text = document.getElementById('status');
	
		// Check if there are code and state in query param, request comes from 42 oauth
		if (code && state) {
			const data = await handleOauthCallback(code, state);
			
			if (data.status === 'Success') {
				// if handleOauthCallback success
				const user_data = await accessResource();
				if (!user_data || user_data.status === 'Error') {
					status_text.textContent = `Error: ${user_data ? user_data.message : 'Fetch failed'}`
					setTimeout(() => window.location.href = '/login', 2000);
					return ;
				}
				console.log('oauth redirect page:')
				console.log(user_data);
				status_text.textContent = 'Successfully logged in';
			} else {
				// if handleOauthCallback error
				status_text.textContent = `Error: ${data.message}`;
				setTimeout(() => window.location.href = '/login', 2000);
			}
		} else {
			// No query params, not from 42 oauth
			status_text.textContent = 'Error: Invalid request';
			setTimeout(() => window.location.href = '/login', 2000);
		}
	}, 0);

	return html;
}
