import getProfileImage from "../../utils/getProfileImage.js";
import getUserData from "../../utils/getUserData.js";
import { isAlphanumeric } from "../../utils/isAlphanumeric.js";
import '../PopUpComponent.js'
import {getString} from "../../utils/languageManagement.js";
import { throwRedirectionEvent } from "../../utils/throwRedirectionEvent.js";
import {sendRequest} from "../../utils/sendRequest.js";
import getUserId from "../../utils/getUserId.js";

class UserInfosComponent extends HTMLElement {

	constructor() {
		super();

		this.hasProfilePictureChanged = false;
	}


	initializeComponent() {
		this.innerHTML = `
			<form>
				<div class="user-info user-info-image">
					<div class="change-profile-image">
						<p id="imageLink">${getString('profileComponent/imageLink')} <i class="fa-solid fa-link"></i></p>
						<p id="uploadImage">${getString('profileComponent/importImage')} <i class="fa-solid fa-upload"></i></p>
						<i class="fa-solid fa-pen profile-picture-pen"></i>
					</div>
					<img id="profileImage" src="" alt="profile picture">
					<input type="file" accept="image/*" name="profile-image">
					<span id="profileImageFeedback" class="input-feedback"></span>
				</div>
				<div class="user-info">
					<p id="username">${getString('profileComponent/username')}</p>
					<input type="text" name="username" maxlength="12" disabled>
					<i class="fa-solid fa-pen classic-pen"></i>
					<span id="usernameFeedback" class="input-feedback"></span>
				</div>
				<div class="user-info">
					<p id="email">${getString('profileComponent/email')}</p>
					<input type="email" name="email" disabled>
					<i class="fa-solid fa-pen classic-pen"></i>
					<span id="emailFeedback" class="input-feedback"></span>
				</div>
				<button-component label="save" class="generic-btn-disabled"></button-component>
			</form>
			<span id="genericErrorFeedback" class="error-feedback"></span>
		`;
	}


	initializeComponentOauth(oauthType) {
		oauthType = oauthType.slice(5, oauthType.length)
		this.innerHTML = `
			<form>
				<div class="user-info user-info-image">
					<div class="change-profile-image">
						<p id="imageLink">${getString('profileComponent/imageLink')} <i class="fa-solid fa-link"></i></p>
						<p id="uploadImage">${getString('profileComponent/importImage')} <i class="fa-solid fa-upload"></i></p>
						<p id="imageOauth">${getString(`profileComponent/image${oauthType}`)} <img src="../../assets/${oauthType}_Logo.png" alt="${oauthType} logo"></p>
						<i class="fa-solid fa-pen profile-picture-pen"></i>
					</div>
					<img id="profileImage" src="" alt="profile picture">
					<input type="file" accept="image/*" name="profile-image">
					<span id="profileImageFeedback" class="input-feedback"></span>
				</div>
				<div class="user-info">
					<p id="username">${getString('profileComponent/username')}</p>
					<input type="text" name="username" maxlength="12" disabled>
					<i class="fa-solid fa-pen classic-pen"></i>
					<span id="usernameFeedback" class="input-feedback"></span>
				</div>
				<button-component label="save" class="generic-btn-disabled"></button-component>
			</form>
			<span id="genericErrorFeedback" class="error-feedback"></span>
		`;
	}


	async connectedCallback() {
		const oauthInfos = await sendRequest("GET", "/api/auth/auth_type/", null);
		this.isOauthLog = oauthInfos.oauth_log;

		if (this.isOauthLog) {
			this.oauthType = oauthInfos.oauth_type;
			this.initializeComponentOauth(oauthInfos.oauth_type);
		} else {
			this.initializeComponent();
		}

		this.usernameInput = this.querySelector('input[name="username"]');
		if (!this.isOauthLog)
			this.emailInput = this.querySelector('input[name="email"]');
		this.profileImageInput = this.querySelector('input[name="profile-image"]');
		this.newUploadedImage = null;
		this.newProfileImageLink = null;
		this.setChangeProfileImageSize();
		this.attachEventsListener();
		this.generateUserInfos();
		this.displayFeedbackFromLocalStorage();
	}

	setChangeProfileImageSize() {
		if (this.querySelector('.change-profile-image').children.length === 3) {
			this.style.setProperty('--choose-image-hover-height', '8rem');
			this.style.setProperty('--choose-image-hover-width', '18rem');
		} else {
			this.style.setProperty('--choose-image-hover-height', '12rem');
			this.style.setProperty('--choose-image-hover-width', '18rem');
		}
	}


	async attachEventsListener() {
		const userData = await getUserData();
		const saveBtn = this.querySelector('button-component');

		// To send a request if button clicked (and valid infos)
		saveBtn.addEventListener('click', (event) => this.handleSaveInfos(event));

		// To set input editable if pen clicked
		this.querySelectorAll('.classic-pen').forEach(penButton => {
			penButton.addEventListener('click', () => this.handlePenButtonClicked(penButton));
		});

		// To handle animation on change-profile-image
		this.querySelector('.change-profile-image').addEventListener('click',  (event) => this.handleExpandImageChoiceAnimation(event));
		this.querySelector('.change-profile-image').addEventListener('mouseleave', (event) => this.handleResetImageChoiceAnimation(event));

		// To handle different type of image setter
		this.querySelector('#imageLink').addEventListener('click', (event) => this.handleDisplaySetImageLinkPopUp());
		this.querySelector('#uploadImage').addEventListener('click', () => this.profileImageInput.click());

		// To handle changed information
		this.addEventListener('input', (event) => this.handleInputsChanged(event, userData));
		this.profileImageInput.addEventListener('change', (event) => this.handleProfileImageUpload(event, userData));
		document.addEventListener('imageLinkSaved', (event) => this.handleProfileImageLinkSet(event, userData));

		const changeImgWithOauth = this.querySelector('#imageOauth');

		if (changeImgWithOauth)
			changeImgWithOauth.addEventListener('click', () => this.handleOauthProfileSet(userData));
	}


	async generateUserInfos() {
		const userImage = this.querySelector('.user-info > img');
		const userData = await getUserData();

		this.usernameInput.value = userData.username;
		if (!this.isOauthLog)
			this.emailInput.value = userData.email;
		userImage.src = getProfileImage(userData);
	}


	/* --- EVENT HANDLER --- */

	// Handle save infos when save button is clicked

	async handleSaveInfos(event) {
		event.preventDefault();
		if (event.target.className === 'generic-btn') {
			let  newUserData = new FormData();

			newUserData.append(this.usernameInput.name, this.usernameInput.value);
			if (!this.isOauthLog)
				newUserData.append(this.emailInput.name, this.emailInput.value);
			if (this.newUploadedImage)
				newUserData.append('profile_image', this.newUploadedImage);
			if (this.newProfileImageLink)
				newUserData.append('profile_image_link', this.newProfileImageLink);

			await postNewUserInfos(newUserData);
		}
	}


	handleInputsChanged(event, userData) {
		if (event.target.type !== 'file') {
			const isValidUsername = this.isValidUsername(this.usernameInput.value);
			const isValidEmail = (this.isOauthLog) ? true : this.isValidEmail(this.emailInput.value);

			this.updateUsernameFeedback(this.usernameInput.value, isValidUsername);
			if (!this.isOauthLog)
				this.updateEmailFeedback(this.emailInput.value, isValidEmail);
			this.updateSaveButtonState(userData, isValidUsername, isValidEmail);
		}
	}


	async handleProfileImageUpload(event, userData) {
		const file = event.target.files[0];
		const reader = new FileReader();
		const profileImageElement = this.querySelector('.user-info-image > img')
		const isValidImage = await this.isValidImageUploaded(event.target.files[0]);

		reader.onload = (event) => {
			if (isValidImage) {
				profileImageElement.src = event.target.result;
				this.hasProfilePictureChanged = true;
				this.newProfileImageLink = null;
				this.newUploadedImage = file;
			} else {
				this.updateImageFeedback(isValidImage, getString("profileComponent/invalidImageFile"));
			}
			this.updateSaveButtonState(userData, this.isValidUsername(this.usernameInput.value), (this.isOauthLog) ? true : this.isValidEmail(this.emailInput.value));
		};

		reader.readAsDataURL(file);
	}


	async handleProfileImageLinkSet(event, userData) {
		const imageUrl = event.detail.url;
		const isValidImageUrl = await this.isValidImageUrl(imageUrl);

		if (isValidImageUrl) {
			this.querySelector('.user-info-image > img').src = event.detail.url;
			this.updateImageFeedback(isValidImageUrl);
			this.newUploadedImage = null;
			this.newProfileImageLink = event.detail.url;
			this.hasProfilePictureChanged = true;
		}
		else {
			this.updateImageFeedback(isValidImageUrl, getString("profileComponent/invalidImageLink"));
		}
		this.updateSaveButtonState(userData, this.isValidUsername(this.usernameInput.value), (this.isOauthLog) ? true : this.isValidEmail(this.emailInput.value));
	}


	async handleOauthProfileSet(userData) {
		const userId = await getUserId();
		let img = await sendRequest("GET", `/api/${this.oauthType}/get_image/?user_id=${userId}`, null);
		if (img)
			img = img.message.profile_picture;
		const isValidImageUrl = await this.isValidImageUrl(img);

		if (isValidImageUrl) {
			this.querySelector('.user-info-image > img').src = img;
			this.updateImageFeedback(isValidImageUrl);
			this.newUploadedImage = null;
			this.newProfileImageLink = img;
			this.hasProfilePictureChanged = true;
		}
		else {
			this.updateImageFeedback(isValidImageUrl, getString("profileComponent/invalidImageLink"));
		}
		this.updateSaveButtonState(userData, this.isValidUsername(this.usernameInput.value), (this.isOauthLog) ? true : this.isValidEmail(this.emailInput.value));
	}


	handleDisplaySetImageLinkPopUp() {
		const popUp = document.createElement('pop-up-component');

		popUp.classList.add('image-link-pop-up');
		document.querySelector('.profile-page').appendChild(popUp);
	}


	handlePenButtonClicked(penButton) {
		const input = penButton.parentElement.querySelector('input');

		input.removeAttribute('disabled');
		input.focus();
		penButton.style.display = 'none';

		const handler = (event) => this.handleClickOutsideInput(event, input, penButton, handler); // Create handler reference to delete it in handleClickOutsideInput (event should be give by eventListener)
		document.addEventListener('click', handler);
	}


	handleClickOutsideInput(event, input, penButton, handler) {
		if (event.target !== input && event.target !== penButton) {
			input.setAttribute('disabled', '');
			penButton.style.display = 'block';
			window.removeEventListener('click', handler);
		}
	}


	handleExpandImageChoiceAnimation(event) {
		const changeProfileImage = this.querySelector('.user-info-image > .change-profile-image');
		const profileImage = this.querySelector('.user-info-image > img');

		changeProfileImage.classList.remove('reset-change-profile-image-size');
		profileImage.classList.remove('reset-image-position');

		changeProfileImage.classList.add('expand-change-profile-image-size');
		profileImage.classList.add('move-image-to-left');
		changeProfileImage.querySelector('.profile-picture-pen').style.display = 'none';
		changeProfileImage.querySelectorAll('p').forEach(elem => { elem.style.display = 'flex'; });
	}


	async handleResetImageChoiceAnimation(event) {
		const changeProfileImage = this.querySelector('.user-info-image > .change-profile-image');
		const profileImage = this.querySelector('.user-info-image > img');

		if (changeProfileImage.className === 'change-profile-image') // To stop first mouseleave animation
			return ;

		changeProfileImage.classList.remove('expand-change-profile-image-size');
		profileImage.classList.remove('move-image-to-left');

		changeProfileImage.classList.add('reset-change-profile-image-size');
		profileImage.classList.add('reset-image-position');
		setTimeout(() => {
			event.target.querySelector('.profile-picture-pen').style.display = 'block';
		}, 250)
		event.target.querySelectorAll('p').forEach(elem => { elem.style.display = 'none'; });
	}


	/* --- CHECK METHODS --- */

	// Check validity of inputs

	isValidUsername(username) {
		return username !== '' && /^[a-zA-Z0-9_-]+$/.test(username);
	}

	isValidEmail(email) {
		return email !== '' && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
	}

	isValidImageUploaded(imageFile) {
		return new Promise(resolve => {
			const img = new Image();

			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);

			const reader = new FileReader();
			reader.onload = (event) => {
				img.src = event.target.result;
			}
			reader.readAsDataURL(imageFile);
		});
	}

	isValidImageUrl(imageUrl) {
		return new Promise(resolve => {
			const img = new Image();

			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
			img.src = imageUrl;
		});
	}


	// Check if new user infos on front is different of user infos in back

	isUserInfosChanged(userData) {
		if (userData[this.usernameInput.name] !== this.usernameInput.value)
			return true;
		if (!this.isOauthLog && userData[this.emailInput.name] !== this.emailInput.value)
			return true;
		if (this.hasProfilePictureChanged)
			return true;
		return false;
	}


	/* --- MANAGE FEEDBACKS / SAVE BUTTON STATE --- */

	// Update elements (button save and feedbacks)

	updateSaveButtonState(userData, isValidUsername, isValidEmail) {
		const saveButton = this.querySelector('button-component');

		if (isValidUsername && isValidEmail && this.isUserInfosChanged(userData)) {
			saveButton.className = 'generic-btn';
		} else {
			saveButton.className = 'generic-btn-disabled';
		}
	}


	// To display feedback if infos has been saved

	displayFeedbackFromLocalStorage() {
		try {
			const response = JSON.parse(localStorage.getItem('userUpdateResponse'));

			if (response) {
				let inputs;
				if (this.isOauthLog)
					inputs = [this.usernameInput, this.profileImageInput];
				else
					inputs = [this.usernameInput, this.emailInput, this.profileImageInput];

				this.showUserInfosFeedback(response, inputs);
				localStorage.removeItem('userUpdateResponse');
			}
		} catch (e) {}
	}


	showUserInfosFeedback(response, inputs) {
		const feedbackErrorElement = this.querySelector('#genericErrorFeedback');

		inputs.forEach(input => {
			const feedbackSuccessElement = input.parentElement.querySelector('.input-feedback');

			if (`${input.name}_error` in response)
				this.updateFeedback(feedbackErrorElement, getString(`profileComponent/${response[`${input.name}_error`]}`), false);
			else if (`${input.name}_message` in response)
				this.updateFeedback(feedbackSuccessElement, getString(`profileComponent/${response[`${input.name}_message`]}`), true);
		});
	}


	// To display feedback on input event

	updateUsernameFeedback(username, isValidUsername) {
		const usernameFeedbackElement = this.usernameInput.parentElement.querySelector('.input-feedback');

		if (!isValidUsername && username === '')
			this.updateFeedback(usernameFeedbackElement, getString("profileComponent/usernameFormatWarning"), isValidUsername);
		else if (!isValidUsername && !isAlphanumeric(username))
			this.updateFeedback(usernameFeedbackElement, getString("profileComponent/invalidUsernameFormat"), isValidUsername);
		else if (usernameFeedbackElement.textContent !== '' && isValidUsername)
			usernameFeedbackElement.textContent = '';
	}


	updateEmailFeedback(email, isValidEmail) {
		const emailFeedbackElement = this.emailInput.parentElement.querySelector('.input-feedback');

		if (!isValidEmail && email === '')
			this.updateFeedback(emailFeedbackElement, getString("profileComponent/emailCannotBeEmpty"), isValidEmail);
		else if (!isValidEmail)
			this.updateFeedback(emailFeedbackElement, getString("profileComponent/invalidEmail"), isValidEmail);
		else if (emailFeedbackElement.textContent !== '' && isValidEmail)
			emailFeedbackElement.textContent = '';
	}


	updateImageFeedback(isValidImage, message) {
		const imageFeedbackElement = this.profileImageInput.parentElement.querySelector('.input-feedback');

		if (!isValidImage) {
			this.updateFeedback(imageFeedbackElement, message);
		} else if (imageFeedbackElement.textContent !== '') {
			imageFeedbackElement.textContent = '';
		}
	}

	// Function to updateFeedbackField

	updateFeedback(feedbackElement, message, isValid) {
		const color = !isValid ? 'red' : '#32CD32';

		feedbackElement.textContent = message;
		feedbackElement.style.color = color;
	}

}

customElements.define('user-infos-component', UserInfosComponent);

async function postNewUserInfos(newUserInfos) {
	const url = `/api/user/change-user-infos/`;

	try {
		const data = await sendRequest('POST', url, newUserInfos, true);

		localStorage.setItem('userUpdateResponse', JSON.stringify(data));
		throwRedirectionEvent('/profile');
	} catch (error) {
		document.querySelector('.error-feedback').innerHTML = getString(`profileComponent/${error.message}`);
	}
}
