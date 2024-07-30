export async function redirectToOauth() {
	try {
		const res = await fetch(`http://localhost:8003/oauth/login/`);
		const data = await res.json();
		console.log(data);
		window.location.replace(data.url);
	} catch (error) {
		console.log(error);
	}
}

export async function handleOauthCallback() {
	const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

	try {
		const res = await fetch(`http://localhost:8003/oauth/redirect?code=${code}&state=${state}/`);
		const data = await res.json();
		console.log(data);
	} catch (error) {
		console.log(error);
	}
}
