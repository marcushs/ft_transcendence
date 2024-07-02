import rotatingGradient from "../anim/rotatingGradient.js";
import getUserData from "../utils/getUserData.js";

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
						<input type="text" name="username" disabled>
						<i class="fa-solid fa-pen"></i>
					</div>
					<div class="user-info">
						<p id="email">Email</p>
						<input type="text" name="email" disabled>
						<i class="fa-solid fa-pen"></i>
					</div>
					<div class="user-info">
						<p id="phone">Phone</p>
						<input type="text" name="phone" disabled>
						<i class="fa-solid fa-pen"></i>
					</div>
					<div class="user-info">
						<p id="firstname">First name</p>
						<input type="text" name="firstname" disabled>
						<i class="fa-solid fa-pen"></i>
					</div>
					<div class="user-info">
						<p id="lastname">Last name</p>
						<input type="text" name="lastname" disabled>
						<i class="fa-solid fa-pen"></i>
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
	}

	async attachEventsListener() {

		this.querySelectorAll('.fa-pen').forEach(penButton => {
			penButton.addEventListener('click', () => this.handleClickOnPenButton(penButton));
		});

		const userData = await getUserData();
		const saveBtn = this.querySelector('button-component');

		this.querySelector('.user-infos-container').addEventListener('input', () => this.handleInputChange(userData, saveBtn));
	}

	handleInputChange(userData, saveBtn) {
		let isSettingsChanged = false;

		this.querySelectorAll('.user-info > input').forEach(input => {
			if (userData[input.name] !== input.value && input.value !== '')
				isSettingsChanged = true;
		});

		if (isSettingsChanged && saveBtn.className === 'generic-btn-disabled') {
			saveBtn.className = 'generic-btn';
		} else if (!isSettingsChanged && saveBtn.className === 'generic-btn') {
			saveBtn.className = 'generic-btn-disabled';
		}
	}

	handleClickOnPenButton(penButton) {
		const input = penButton.parentElement.querySelector('input');

		input.removeAttribute('disabled');
		penButton.style.display = 'none';

		const handler = (event) => this.handleClickOutside(event, input, penButton, handler); // Create handler reference to delete it in handleClickOutside (event should be give by eventListener)
		window.addEventListener('click', handler);
	}

	handleClickOutside(event, input, penButton, handler) {
		if (event.target !== input && event.target !== penButton) {
			input.setAttribute('disabled', '');
			penButton.style.display = 'block';
			window.removeEventListener('click', handler);
		}

	}

	async generateUserInfos() {
		const userInfosInputs = this.querySelectorAll('input');
		const userData = await getUserData();
		const userInfos = [userData.username, userData.email, userData.phone, userData.firstname, userData.lastname]

		userInfosInputs.forEach((input, index) => {
			if (userInfos[index])
				input.value = userInfos[index];
		});

		this.querySelector('.profile-picture').style.backgroundImage =
				`url(${(userData.profile_image !== undefined) ? userData.profile_image : '../../assets/anonymous-profile-picture.png'})`;
	}
}

customElements.define('profile-component', ProfileComponent);