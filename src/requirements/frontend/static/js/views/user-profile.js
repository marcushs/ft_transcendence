import rotatingGradient from '../anim/rotatingGradient.js';
import getProfileImage from '../utils/getProfileImage.js';
import { sendRequest } from '../utils/sendRequest.js';
import '../components/FriendshipButtonComponent.js';
import "../components/NavBarComponent.js";

export default async () => {
    const friends_status = await checkFriendshipStatus();

    const html = `
    <section class="users-profile-page">
        <nav-bar-component></nav-bar-component>
            <div class="users-profile-container-background"></div>
            <div class="users-profile-container">
                <div class="users-profile-content">
                    <div class="user-info user-info-image">
                    <img id="profileImage" src="" alt="">
                    </div>
                    <friendship-button-component button-status=${friends_status}></friendship-button-component>
                    <div class="user-info">
                    <p id="username">Username</p>
                    <input type="text" name="username" maxlength="12" disabled>
                    </div>
                </div>
            </div>
        </section>
    `;

    setTimeout(() => {
        rotatingGradient('.users-profile-container', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-container-background', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-content', '#1c0015', '#001519');
        displayInformation();
    }, 0)

    return html;
}

async function displayInformation() {
    const targetUsername = localStorage.getItem('users-profile-target-username');

    if (targetUsername === null)
        return;
    const infoList = await getInformation(targetUsername);
    if (!infoList) {
        console.log('this user cannot be found..')
        return;
    }
    document.querySelector('.user-info > img').src = getProfileImage(infoList);
    document.querySelector('input[name="username"]').value = infoList.username;
}
    
async function getInformation(targetUsername) {
    const url = `http://localhost:8000/user/get_user/?q=${targetUsername}`;
    
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

async function checkFriendshipStatus() {
    const targetUsername = localStorage.getItem('users-profile-target-username');
    const url = `http://localhost:8003/friends/friendship_status/?q=${targetUsername}`

    try {
        const data = await sendRequest('GET', url, null);
        return data.status;
    } catch (error) {
        console.error(error);
        return 'self';
    }
}