import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../../utils/getProfileImage.js";


export class UserProfile {
    constructor(username) {
        this.target = username;
        this.usernameInput = this.querySelector('input[name="username"]');
		this.emailInput = this.querySelector('input[name="email"]');
        this.element = document.querySelector('.profile-main-section')
        this.render();


        this.displayUserProfile();
    }
    
    render() {
        this.element.innerHTML = `
            <div class="user-info user-info-image">
                <img id="profileImage" src="" alt="">
                <input type="file" accept="image/*" name="profile-image">
                <span id="profileImageFeedback" class="input-feedback"></span>
            </div>
            <div class="user-info">
                <p id="username">Username</p>
                <input type="text" name="username" maxlength="12" disabled>
            </div>
            <div class="user-info">
                <p id="email">Email</p>
                <input type="email" name="email" disabled>
            </div>
        `;
    }
    async displayUserProfile() {
        if (this.target === null)
            return;
        infoList = await getInformation();
        if (!infoList) {
            console.log('this user cannot be found..')
            return;
        }
        const userImage = this.querySelector('.user-info > img');
        this.usernameInput = infoList.username
        this.emailInput = infoList.email
        userImage.src = getProfileImage(infoList);
    }
    
    async getInformation() {
        const url = `http://localhost:8000/user/get_user/?q=${this.target}`
        try {
            const data = await sendRequest('GET', url, null);
            if (data.status === 'success') {
                return data.message;
            } else {
                console.log(data.message);
                return null
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}