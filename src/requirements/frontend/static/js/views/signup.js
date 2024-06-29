import formWave from "../anim/formWave.js";
import "../components/ButtonComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import getCookie from "../utils/getCookie.js";

export default () => {
	const html = `
		<section class="signup-page">
			<div class="signup-form-container-background"></div>
			<div class="signup-form-container">
				<form>
					<h1>Signup</h1>
					<div class="form-fields">
						<input type="text" placeholder="Username" name="username" required>
					</div>
					<div class="form-fields">
						<input type="text" placeholder="Email" name="email" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Password" name="password" required>
					</div>
					<div class="form-fields">
						<input type="password" placeholder="Confirm password" name="confirm_password" required>
					</div>
					<button-component id="registerBtn" label="Signup" class="special-btn"></button-component>
					<p>Already have an account? <a href="/login">Login</a></p>
				</form>
			</div>
		</section>`;

	setTimeout(() =>{
		rotatingGradient('.signup-form-container-background');
		rotatingGradient('.signup-form-container');
		const registerBtn = document.querySelector('#registerBtn');
		registerBtn.addEventListener('click', event => postData(event, registerBtn));
	}, 0);

	return html;
}


async function postData(event, registerBtn) {
	// Prevent form submission
	event.preventDefault();
	// Get the closest form element of the button
	const form = registerBtn.closest('form');
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
			const res = await fetch(`http://localhost:8000/account/signup/`, config);
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
