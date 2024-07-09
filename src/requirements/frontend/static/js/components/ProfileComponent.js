import rotatingGradient from "../anim/rotatingGradient.js";
import getProfileImage from "../utils/getProfileImage.js";
import getUserData from "../utils/getUserData.js";
import { isContainWhitespace, isAlphanumeric } from "../utils/utils.js";
import {getCookie} from "../utils/cookie.js";

class ProfileComponent extends HTMLElement {

	// Component creation

	constructor() {
		super();

		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
            <div class="profile-component-background"></div>
			<div class="profile-component-content">
				<div class="user-infos-container">
					<div class="user-info user-info-image">
						<img src="" alt="">
						<i class="fa-solid fa-pen profile-picture-pen"></i>
						<input type="file" accept="image/*" name="profile-image">
					</div>
					<div class="user-info">
						<p id="username">Username</p>
						<input type="text" name="username" maxlength="12" disabled>
						<i class="fa-solid fa-pen classic-pen"></i>
						<span id="usernameFeedback" class="input-feedback"></span>
					</div>
					<div class="user-info">
						<p id="email">Email</p>
						<input type="email" name="email" disabled>
						<i class="fa-solid fa-pen classic-pen"></i>
						<span id="emailFeedback" class="input-feedback"></span>
					</div>
					<button-component label="Save" class="generic-btn-disabled"></button-component>
				</div>
				<div class="stats-infos-container"></div>
			</div>
		`;
	}


	connectedCallback() {
		rotatingGradient('profile-component');
		rotatingGradient('.profile-component-background');

		this.attachEventsListener();
		this.generateUserInfos();
		this.displayFeedbackFromLocalStorage();
	}


	async attachEventsListener() {
		const userData = await getUserData();
		const saveBtn = this.querySelector('button-component');
		const imageInput = this.querySelector('input[name="profile-image"]');

		saveBtn.addEventListener('click', (event) => this.handleSaveInfos(event));
		this.addEventListener('input', (event) => this.handleInputsChanged(userData));
		imageInput.addEventListener('change', (event) => this.handlePictureImageChanged(event, userData));

		this.querySelector('.profile-picture-pen').addEventListener('click', () => imageInput.click());
		this.querySelectorAll('.classic-pen').forEach(penButton => {
			penButton.addEventListener('click', () => this.handlePenButtonClicked(penButton));
		});
	}


	async generateUserInfos() {
		const usernameInput = this.querySelector('input[name="username"]');
		const emailInput = this.querySelector('input[name="email"]');
		const userImage = this.querySelector('.user-info > img');
		const userData = await getUserData();

		usernameInput.value = userData.username;
		emailInput.value = userData.email;
		userImage.src = getProfileImage(userData);
	}

	// A refactorer
	displayFeedbackFromLocalStorage() {
		const response = JSON.parse(localStorage.getItem('userUpdateResponse'));

		if (response) {
			const inputs = this.querySelectorAll('.user-info > input[type="text"], .user-info > input[type="email"]');

			this.showUserInfosFeedback(response, inputs);
			localStorage.removeItem('userUpdateResponse');
		}
	}


	// EVENT HANDLER //

	// Handle save infos when save button is clicked

	async handleSaveInfos(event) {
		if (event.target.className === 'generic-btn') {
			let  newUserData = new FormData();
			const usernameInput = this.querySelector('input[name="username"]');
			const emailInput = this.querySelector('input[name="email"]');
			const imageInput = this.querySelector('input[name="profile-image"]');

			newUserData.append(usernameInput.name, usernameInput.value);
			newUserData.append(emailInput.name, emailInput.value);
			newUserData.append('profile_image', imageInput.files[0]);

			const requestResponse = await postNewUserInfos(newUserData);

			localStorage.setItem('userUpdateResponse', JSON.stringify(requestResponse));
			location.reload();
		}
	}


	// Handle inputs changed and image changed

	handleInputsChanged(userData) {
		const usernameInput = this.querySelector('input[name="username"]');
		const emailInput = this.querySelector('input[name="email"]');
		const isValidUsername = this.isValidUsername(usernameInput.value);
		const isValidEmail = this.isValidEmail(emailInput.value);

		this.updateUsernameFeedback(usernameInput.value, isValidUsername);
		this.updateEmailFeedback(emailInput.value, isValidEmail);
		// Update wrong input
		this.updateSaveButtonState(userData, isValidUsername, isValidEmail);
	}


	handlePictureImageChanged(event, userData) {
		const file = event.target.files[0];
		const reader = new FileReader();
		const profileImageElement = this.querySelector('.user-info-image > img')

		reader.onload = (event) => { profileImageElement.src = event.target.result; };

		reader.readAsDataURL(file);
	}


	// Check validity of inputs

	isValidUsername(username) {
		return username !== '' && isAlphanumeric(username);
	}

	isValidEmail(email) {
		return email !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}


	// Check if user infos is different of user infos of the profile

	isUserInfosChanged(userData) {
		const usernameInput = this.querySelector('input[name="username"]');
		const emailInput = this.querySelector('input[name="email"]');
		const profileImageElement = this.querySelector('.user-info-image > img');

		if (userData[usernameInput.name] !== usernameInput.value)
			return true;
		if (userData[emailInput.name] !== emailInput.value)
			return true;
		if (userData['profile-image'] !== profileImageElement.src)
			return true;
		return false;
	}


	// Update elements (button save and feedbacks)

	updateSaveButtonState(userData, isValidUsername, isValidEmail) {
		const saveButton = this.querySelector('button-component');

		if (isValidUsername && isValidEmail && this.isUserInfosChanged(userData)) {
			saveButton.className = 'generic-btn';
		} else {
			saveButton.className = 'generic-btn-disabled';
		}
	}

	updateUsernameFeedback(username, isValidUsername) {
		const usernameFeedbackElement = this.querySelector('input[name="username"]').parentElement.querySelector('.input-feedback');

		if (!isValidUsername)
			usernameFeedbackElement.style.color = 'red';

		if (!isValidUsername && username === '')
			usernameFeedbackElement.textContent = 'Username cannot be empty';
		else if (!isValidUsername && !isAlphanumeric(username))
			usernameFeedbackElement.textContent = 'Username can contain only letters and numbers';
		else if (usernameFeedbackElement.textContent !== '' && isValidUsername)
			usernameFeedbackElement.textContent = '';
	}

	updateEmailFeedback(email, isValidEmail) {
		const emailFeedbackElement = this.querySelector('input[name="email"]').parentElement.querySelector('.input-feedback');

		if (!isValidEmail)
			emailFeedbackElement.style.color = 'red';

		if (!isValidEmail && email === '')
			emailFeedbackElement.textContent = 'Email address cannot be empty';
		else if (!isValidEmail)
			emailFeedbackElement.textContent = 'Invalid email address';
		else if (emailFeedbackElement.textContent !== '' && isValidEmail)
			emailFeedbackElement.textContent = '';
	}

	
	////////////////////////////////////////////////


	handlePenButtonClicked(penButton) {
		const input = penButton.parentElement.querySelector('input[type="text"], input[type="email"]');

		input.removeAttribute('disabled');
		input.focus();
		penButton.style.display = 'none';

		const handler = (event) => this.handleClickOutsideInput(event, input, penButton, handler); // Create handler reference to delete it in handleClickOutsideInput (event should be give by eventListener)
		window.addEventListener('click', handler);
	}


	showUserInfosFeedback(response, inputs) {
		inputs.forEach(input => {
			const feedbackElement = input.parentElement.querySelector('.input-feedback');

			if (`${input.name}_error` in response)
				this.updateUserInfosFeedback(feedbackElement, response[`${input.name}_error`], true);
			else if (`${input.name}_message` in response)
				this.updateUserInfosFeedback(feedbackElement, response[`${input.name}_message`], false);
		});
	}

	updateUserInfosFeedback(feedbackElement, message, isError) {
		const color = isError ? 'red' : '#32CD32';

		feedbackElement.textContent = message;
		feedbackElement.style.color = color;
	}


	handleClickOutsideInput(event, input, penButton, handler) {
		if (event.target !== input && event.target !== penButton) {
			input.setAttribute('disabled', '');
			penButton.style.display = 'block';
			window.removeEventListener('click', handler);
		}
	}

}

customElements.define('profile-component', ProfileComponent);

async function postNewUserInfos(newUserInfos) {
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			// 'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
		},
		body: newUserInfos,
		credentials: 'include' // Needed for send cookie
	};

	console.log(config);
	try {
		const res = await fetch(`http://localhost:8000/account/change-username/`, config);
		if (res.status == 403) {
			throw new Error('Access Denied');
		}
		return await res.json();
	} catch (error) {
		console.log(error);
	}
}