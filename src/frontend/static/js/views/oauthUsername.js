import { getCookie } from "../utils/cookie.js";
import { getPortNumber } from "../utils/oauthUtils.js";

export default () => {
	const html = `
		<h1>Username already taken, please choose a new one (max char. : 12)</h1>
		<form>
			<input type="text" placeholder="username" name="newUsername" id="username" style="background-color: white;"/>
			<span id="inputFeedback"></span>
		</form>
		<button type="button" id="btn">Submit</button>
	`;

	setTimeout(() => {
		const btn = document.getElementById('btn');
		
		btn.addEventListener("click", postNewUsername);
	}, 0);
	return html;
}

async function postNewUsername() {
	const inputFeedback = document.getElementById("inputFeedback");
	const newUsername = document.getElementById('username').value;
	const urlParams = new URLSearchParams(window.location.search);
	const oauthProvider = urlParams.get('oauth_provider');

	inputFeedback.innerText = '';

	if (checkUsernameValidity(newUsername) === false) {

		inputFeedback.innerText = "Invalid input";
		inputFeedback.style = "red";
	}
	console.log(newUsername)
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
		},
		credentials: 'include', // Needed for send cookie
		body: JSON.stringify({newUsername: newUsername}), // Send form values as JSON
	};

	try {
		const res = await fetch(`/api/${oauthProvider}/update_username/`, config);
		// if (res.status == 403)
		// 	throw new Error('Access Denied')
		const data = await res.json();
		if (data.status === "Error")
			alert(data.message)
		else
			window.location.replace(data.url);
	} catch (error) {
		// console.log('Catch error :', error);
	}
}

function checkUsernameValidity(username) {
	username = username.replace(/[^\x20-\x7E]/g, '')
	username = username.trim();

	if (username === '' || username.length > 12 )
		return false;
	return true;
}username
