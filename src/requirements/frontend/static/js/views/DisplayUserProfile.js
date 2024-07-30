import { sendRequest } from "../utils/sendRequest.js";
import getProfileImage from "../utils/getProfileImage.js";
import rotatingGradient from "../anim/rotatingGradient.js";


export class DisplayUserProfile {
    constructor(username) {
        this.target = username;
        this.element = document.querySelector('.profile-main-section')
        this.render();
        this.usernameInput = document.querySelector('input[name="username"]');


        this.displayInformation();
        setTimeout(() => {
            rotatingGradient('.users-profile-page', '#FF16C6', '#00D0FF');
            rotatingGradient('.users-profile-container-background', '#FF16C6', '#00D0FF');
            rotatingGradient('.users-profile-container', '#1c0015', '#001519');
        }, 0)
    }
    
    render() {
        this.element.innerHTML = `
            <section class="users-profile-page">
                <div class="users-profile-container-background"></div>
			    <div class="users-profile-container">
                    <div class="user-info user-info-image">
                        <img id="profileImage" src="" alt="">
                    </div>
                    <div class="user-info">
                        <p id="username">Username</p>
                        <input type="text" name="username" maxlength="12" disabled>
                    </div>
                </div>
            </section>
        `;
    }
    async displayInformation() {
        if (this.target === null)
            return;
        const infoList = await this.getInformation();
        if (!infoList) {
            console.log('this user cannot be found..')
            return;
        }
        console.log('Username Input:', this.usernameInput); // Debugging line
        const userImage = document.querySelector('.user-info > img');
        this.usernameInput.value = infoList.username
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