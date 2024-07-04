import rotatingGradient from "../anim/rotatingGradient.js";
import getUserData from "../utils/getUserData.js";
import {getCookie} from "../utils/cookie.js";

class ProfileComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
            <div class="profile-component-background"></div>
			<div class="profile-component-content">
				<div class="user-infos-container">
					<div class="profile-picture"></div>
					<div class="user-info">
						<p id="username">Username</p>
						<input type="text" name="username" maxlength="12" disabled>
						<i class="fa-solid fa-pen"></i>
						<span id="usernameFeedback" class="input-feedback"></span>
					</div>
					<div class="user-info">
						<p id="email">Email</p>
						<input type="text" name="email" disabled>
						<i class="fa-solid fa-pen"></i>
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
		this.generateUserInfos();
		this.attachEventsListener();
		this.displayFeedbackFromLocalStorage();
	}


	async generateUserInfos() {
		const userInfosInputs = this.querySelectorAll('input');
		const userData = await getUserData();
		const userInfos = [userData.username, userData.email, userData.phone, userData.firstname, userData.lastname];

		userInfosInputs.forEach((input, index) => {
			if (userInfos[index])
				input.value = userInfos[index];
		});

		this.querySelector('.profile-picture').style.backgroundImage =
			`url(${(userData.profile_image !== undefined) ? userData.profile_image : '../../assets/anonymous-profile-picture.png'})`;
	}


	async attachEventsListener() {
		const userData = await getUserData();
		const saveBtn = this.querySelector('button-component');

		this.querySelector('.user-infos-container').addEventListener('input', (event) => this.handleInputChange(event, userData, saveBtn));
		this.querySelector('button-component').addEventListener('click', (event) => this.handleClickOnSaveBtn(event));

		this.querySelectorAll('.fa-pen').forEach(penButton => {
			penButton.addEventListener('click', () => this.handleClickOnPenButton(penButton));
		});
	}


	handleInputChange(event, userData, saveBtn) {
		let isSettingsChanged = false;
		let isValidEmail;

		this.querySelectorAll('.user-info > input').forEach(input => {
			if (userData[input.name] !== input.value && input.value !== '')
				isSettingsChanged = true;
			if (input.name === 'email')
				isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
		});

		this.updateEmailFeedback(isValidEmail);

		if (isSettingsChanged && isValidEmail && saveBtn.className === 'generic-btn-disabled') {
			saveBtn.className = 'generic-btn';
		} else if (!isSettingsChanged && saveBtn.className === 'generic-btn') {
			saveBtn.className = 'generic-btn-disabled';
		}
	}

	updateEmailFeedback(isValidEmail) {
		const emailInputFeedback = this.querySelector('input[name="email"]').parentElement.querySelector('.input-feedback');

		if (emailInputFeedback.textContent === '' && !isValidEmail) {
			emailInputFeedback.style.color = 'red';
			emailInputFeedback.textContent = 'Invalid email address';
		} else if (emailInputFeedback.textContent !== '' && isValidEmail) {
			emailInputFeedback.textContent = '';
		}
	}

	async handleClickOnSaveBtn(event) {
		let  newUserInfos = {};
		const inputs = this.querySelectorAll('.user-info > input');

		if (event.target.className !== 'generic-btn')
			return ;

		inputs.forEach(input => {
			newUserInfos[input.name] = input.value;
		});

		const response = await postNewUserInfos(newUserInfos);

		localStorage.setItem('userUpdateResponse', JSON.stringify(response));
		location.reload();
	}

	displayFeedbackFromLocalStorage() {
		const response = JSON.parse(localStorage.getItem('userUpdateResponse'));

		if (response) {
			const inputs = this.querySelectorAll('.user-info > input');

			this.showUserInfosFeedback(response, inputs);
			localStorage.removeItem('userUpdateResponse');
		}
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

	handleClickOnPenButton(penButton) {
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

}

customElements.define('profile-component', ProfileComponent);

async function postNewUserInfos(newUserInfos) {
	const config = {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
		},
		body: JSON.stringify(newUserInfos),
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