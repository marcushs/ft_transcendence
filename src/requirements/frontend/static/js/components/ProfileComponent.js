import rotatingGradient from "../anim/rotatingGradient.js";
import getProfileImage from "../utils/getProfileImage.js";
import getUserData from "../utils/getUserData.js";
import { isContainWhitespace, isAlphanumeric } from "../utils/utils.js";
import {getCookie} from "../utils/cookie.js";

class ProfileComponent extends HTMLElement {

	// Component creation

	constructor() {
		super();

		this.hasProfilePictureChanged = false;
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

		this.usernameInput = this.querySelector('input[name="username"]');
		this.emailInput = this.querySelector('input[name="email"]');
		this.profileImageInput = this.querySelector('input[name="profile-image"]');
		this.attachEventsListener();
		this.generateUserInfos();
		this.displayFeedbackFromLocalStorage();
	}


	async attachEventsListener() {
		const userData = await getUserData();
		const saveBtn = this.querySelector('button-component');

		saveBtn.addEventListener('click', (event) => this.handleSaveInfos(event));
		this.addEventListener('input', (event) => this.handleInputsChanged(event, userData));
		this.profileImageInput.addEventListener('change', (event) => this.handlePictureImageChanged(event, userData));

		this.querySelector('.profile-picture-pen').addEventListener('click', () => this.profileImageInput.click());
		this.querySelectorAll('.classic-pen').forEach(penButton => {
			penButton.addEventListener('click', () => this.handlePenButtonClicked(penButton));
		});
	}


	async generateUserInfos() {
		const userImage = this.querySelector('.user-info > img');
		const userData = await getUserData();

		this.usernameInput.value = userData.username;
		this.emailInput.value = userData.email;
		userImage.src = getProfileImage(userData);
	}


	/* --- EVENT HANDLER --- */

	// Handle save infos when save button is clicked

	async handleSaveInfos(event) {
		if (event.target.className === 'generic-btn') {
			let  newUserData = new FormData();

			newUserData.append(this.usernameInput.name, this.usernameInput.value);
			newUserData.append(this.emailInput.name, this.emailInput.value);
			newUserData.append('profile_image', this.profileImageInput.files[0]);

			const requestResponse = await postNewUserInfos(newUserData);

			localStorage.setItem('userUpdateResponse', JSON.stringify(requestResponse));
			location.reload();
		}
	}


	handleInputsChanged(event, userData) {
		if (event.target.type !== 'file') {
			const isValidUsername = this.isValidUsername(this.usernameInput.value);
			const isValidEmail = this.isValidEmail(this.emailInput.value);

			this.updateUsernameFeedback(this.usernameInput.value, isValidUsername);
			this.updateEmailFeedback(this.emailInput.value, isValidEmail);
			this.updateSaveButtonState(userData, isValidUsername, isValidEmail);
		}
	}


	handlePictureImageChanged(event, userData) {
		const file = event.target.files[0];
		const reader = new FileReader();
		const profileImageElement = this.querySelector('.user-info-image > img')

		reader.onload = (event) => {
			profileImageElement.src = event.target.result;
			this.hasProfilePictureChanged = true;
			this.updateSaveButtonState(userData, this.isValidUsername(this.usernameInput.value), this.isValidEmail(this.emailInput.value));
		};

		reader.readAsDataURL(file);
	}

	function powerBy(a) {
		return function test(2) {
			return 2 + a
		}
	}

	handlePenButtonClicked(penButton) {
		const input = penButton.parentElement.querySelector('input');

		input.removeAttribute('disabled');
		input.focus();
		penButton.style.display = 'none';

		const handler = (event) => this.handleClickOutsideInput(event, input, penButton, handler); // Create handler reference to delete it in handleClickOutsideInput (event should be give by eventListener)
		window.addEventListener('click', handler);
	}


	handleClickOutsideInput(event, input, penButton, handler) {
		if (event.target !== input && event.target !== penButton) {
			input.setAttribute('disabled', '');
			penButton.style.display = 'block';
			window.removeEventListener('click', handler);
		}
	}


	/* --- CHECK METHODS --- */

	// Check validity of inputs

	isValidUsername(username) {
		return username !== '' && /^[a-zA-Z0-9_-]+$/.test(username);
	}

	isValidEmail(email) {
		return email !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}


	// Check if new user infos on front is different of user infos in back

	isUserInfosChanged(userData) {
		if (userData[this.usernameInput.name] !== this.usernameInput.value)
			return true;
		if (userData[this.emailInput.name] !== this.emailInput.value)
			return true;
		if (this.hasProfilePictureChanged)
			return true;
		return false;
	}


	/* --- MANAGE FEEDBACKS / SAVE BUTTON STATE --- */

	// Update elements (button save and feedbacks)

	updateSaveButtonState(userData, isValidUsername, isValidEmail) {
		const saveButton = this.querySelector('button-component');

		// console.log(isValidUsername, isValidEmail, this.isUserInfosChanged(userData))
		console.log(this.hasProfilePictureChanged);
		if (isValidUsername && isValidEmail && this.isUserInfosChanged(userData)) {
			saveButton.className = 'generic-btn';
		} else {
			saveButton.className = 'generic-btn-disabled';
		}
	}


	// To display feedback if infos has been saved

	displayFeedbackFromLocalStorage() {
		const response = JSON.parse(localStorage.getItem('userUpdateResponse'));

		if (response) {
			const inputs = [this.usernameInput, this.emailInput];

			this.showUserInfosFeedback(response, inputs);
			localStorage.removeItem('userUpdateResponse');
		}
	}


	showUserInfosFeedback(response, inputs) {
		inputs.forEach(input => {
			const feedbackElement = input.parentElement.querySelector('.input-feedback');

			if (`${input.name}_error` in response)
				this.updateFeedback(feedbackElement, response[`${input.name}_error`], false);
			else if (`${input.name}_message` in response)
				this.updateFeedback(feedbackElement, response[`${input.name}_message`], true);
		});
	}


	// To display feedback on input event

	updateUsernameFeedback(username, isValidUsername) {
		const usernameFeedbackElement = this.usernameInput.parentElement.querySelector('.input-feedback');

		if (!isValidUsername && username === '')
			this.updateFeedback(usernameFeedbackElement, 'Username cannot be empty', isValidUsername);
		else if (!isValidUsername && !isAlphanumeric(username))
			this.updateFeedback(usernameFeedbackElement, "Username can contain only: letters, numbers, _ and -", isValidUsername);
		else if (usernameFeedbackElement.textContent !== '' && isValidUsername)
			usernameFeedbackElement.textContent = '';
	}


	updateEmailFeedback(email, isValidEmail) {
		const emailFeedbackElement = this.emailInput.parentElement.querySelector('.input-feedback');

		if (!isValidEmail && email === '')
			this.updateFeedback(emailFeedbackElement, 'Email address cannot be empty', isValidEmail);
		else if (!isValidEmail)
			this.updateFeedback(emailFeedbackElement, 'Invalid email address', isValidEmail);
		else if (emailFeedbackElement.textContent !== '' && isValidEmail)
			emailFeedbackElement.textContent = '';
	}


	// Function to updateFeedbackField

	updateFeedback(feedbackElement, message, isValid) {
		const color = !isValid ? 'red' : '#32CD32';

		feedbackElement.textContent = message;
		feedbackElement.style.color = color;
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