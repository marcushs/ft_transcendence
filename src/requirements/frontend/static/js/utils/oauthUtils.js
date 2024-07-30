export async function redirectToOauth() {
	try {
		console.log('hello')
		const res = await fetch(`http://localhost:8003/oauth/login/`);
		const data = await res.json();
		console.log(data);
		window.location.replace(data.url);
	} catch (error) {
		console.log(error);
	}
}
