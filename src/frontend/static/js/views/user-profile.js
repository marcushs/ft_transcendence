import rotatingGradient from '../anim/rotatingGradient.js';
import getProfileImage from '../utils/getProfileImage.js';
import { sendRequest } from '../utils/sendRequest.js';
import '../components/Friendship/FriendshipButtonComponent.js';
import "../components/NavBarComponent.js";
import { throwRedirectionEvent } from '../utils/throwRedirectionEvent.js';

export default () => {
    const html = `
    <section class="users-profile-page">
        <nav-bar-component></nav-bar-component>
            <div class="users-profile-container-background"></div>
            <div class="users-profile-container">
                <div class="users-profile-content">
                    <div class="user-info user-info-image">
                    <img id="profileImage" src="" alt="">
                    </div>
                    <div class="user-info">
                    <p id="username">Username</p>
                    <p class='user-info-username'></p>
                    </div>
                </div>
            </div>
			<contact-menu-component></contact-menu-component>
        </section>
    `;

    setTimeout( async () => {
        rotatingGradient('.users-profile-container', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-container-background', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-content', '#1c0015', '#001519');

        const infoList = await getInformation();
        if (infoList === null) {
            throwRedirectionEvent('/');
            return;
        }
        displayInformation(infoList);
        const friends_status = await checkFriendshipStatus();
        if (friends_status) {
            const divUserContent = document.querySelector('.users-profile-content');
            divUserContent.innerHTML += `<friendship-button-component button-status=${friends_status}></friendship-button-component>`
        }
    }, 0)

    return html;
}

async function displayInformation(infoList) {
    document.querySelector('.user-info > img').src = getProfileImage(infoList);
    document.querySelector('.user-info-username').textContent = infoList.username;
}
    
async function getInformation() {
    const targetUsername = localStorage.getItem('users-profile-target-username');
    if (targetUsername === null)
        return null;
    const url = `http://localhost:8000/user/get_user/?q=${targetUsername}`;
    
    try {
        const data = await sendRequest('GET', url, null);
        if (data.status === 'success') {
            return data.message;
        } else {
            return null;
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
        if (data.status === 'success')
            return data.friend_status;
        return null;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}