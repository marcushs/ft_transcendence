export default () => {
	const html = `
		<h1>Username already taken, please choose a new one (max char. : 12)</h1>
		<input type="text" placeholder="username" id="username" style="background-color: white;"/>
		<button type="button">Submit</button>
	`;

	return html;
}

async function postNewUsername() {
	
}
