// import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import {getCookie} from "../utils/cookie.js";
import index from "./index.js";

export default () => {
	const html = `
		<section class="login-page">
			<div class="login-form-container-background"></div>
			<div class="login-form-container">
				<form>
					<h1>Login</h1>
					<div class="form-fields">
						<input type="text" placeholder="Username" name="username" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" name="password" required>
					</div>
					<button-component id="loginBtn" label="Login" class="special-btn"></button-component>
					<p>Don't have an account? <a href="/signup">Signup</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		rotatingGradient('.login-form-container-background');
		rotatingGradient('.login-form-container');
		const loginBtn = document.querySelector('#loginBtn');
		loginBtn.addEventListener('click', event => postData(event, loginBtn));
	}, 0);
	return html;
}

async function postData(event, loginBtn) {
	// Prevent form submission
	event.preventDefault();
	// Get the closest form element of the button
	const form = loginBtn.closest('form');
	if (form) {
		// Construct a FormData object, a set of key/value pairs
		const formData = new FormData(form);
		// formData.entries() return an iterator that traverse all the key/value pairs
		// Object.fromEntries() transforms a list of key-value pairs into an object

		const formValues = Object.fromEntries(formData.entries());
		const json = JSON.stringify(formValues);
		console.log(json)
		const config = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
			},
			credentials: 'include', // Needed for send cookie
			body: json, // Send form values as JSON
		};

		try {
			console.log(config)
			const res = await fetch(`http://localhost:8000/account/login/`, config);
			if (res.status == 403)
				throw new Error('Access Denied')
			const data = await res.json();
			if (data.error)
				alert(data.error)
			else
				window.location.replace(data.redirect_url);
		} catch (error) {
			if (error.data && error.data.status === 'jwt_failed') {
				history.replaceState("", "", "/");
				document.title = "Index";
				app.innerHTML = index();
			}
			console.log('Catch error :', error);
			alert(`Error: ${error.message}`)
		}
	} else {
		console.error('No form found!');
	}
}