import rotatingGradient from '../anim/rotatingGradient.js';
import getProfileImage from '../utils/getProfileImage.js';
import { sendRequest } from '../utils/sendRequest.js';
import '../components/Friendship/FriendshipButtonComponent.js';
import "../components/NavBarComponent.js";
import { throwRedirectionEvent } from '../utils/throwRedirectionEvent.js';
import "../components/Chat/ChatComponent.js";
import { getUserId } from '../utils/chatUtils/joinRoomUtils.js';
import UserProfileSendMessageBtn from '../components/Profile/UserProfileSendMessageBtn.js';
import {getString} from "../utils/languageManagement.js";

export default () => {
    const html = `
    <section class="users-profile-page">
        <nav-bar-component></nav-bar-component>
        <div class="users-profile-container-background"></div>
        <div class="users-profile-container">
            <div class="users-profile-content">
                <div class="user-info">
                    <img id="profileImage" src="" alt="">
                    <p class='username'></p>
                </div>
                <div class="user-stats"></div>
            </div>
        </div>
        <contact-menu-component></contact-menu-component>
        <chat-component></chat-component>
        </section>
    `;

    setTimeout( async () => {
        rotatingGradient('.users-profile-container', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-container-background', '#FF16C6', '#00D0FF');
        rotatingGradient('.users-profile-content', '#1c0015', '#001519');

        const targetUsername = location.pathname.split('/')[2];
        let userInfos = await sendRequest('GET', `/api/user/get_user/?q=${targetUsername}`, null);

        if (userInfos.status === "error") {
            fillNoUserFound();
            return ;
        }

        userInfos = userInfos.message;

        await fillUserInfos(userInfos);
        await fillUserStats(userInfos);
        await displayButtons(userInfos);
    }, 0);

    return html;
}


function fillNoUserFound() {
    const userProfileContent = document.querySelector('.users-profile-content');

    userProfileContent.innerHTML = `
        <div class="no-user-found">
            <p>User doesn't exists.</p>
        </div>
    `;
}


async function fillUserStats(userInfos) {
    const userStatsElements = document.querySelector('.user-stats');
    let statistics = await sendRequest('GET', `/api/statistics/get_user_statistics/?q=${userInfos.id}`, null);

    statistics = statistics.user_statistics;

    userStatsElements.innerHTML = `
        <div class="rank-infos">
            ${createRankContainer(statistics.rank, statistics.rank_points)}
        </div>
        <div class="game-infos">
            <div class="first-section">
                <div class="info">
                    <p>${getString("statistics/gamesPlayed")}</p>
                    <div class="number-container">
                        <p>${statistics.total_game_played}</p>
                    </div>
                </div>
                <div class="info">
                    <p>${getString("statistics/gamesWin")}</p>
                    <div class="number-container">
                        <p>${statistics.total_win}</p>
                    </div>
                </div>
            </div>
            <div class="second-section">
                <div class="info">
                    <p>${getString("statistics/winLoseRatio")}</p>
                    <div class="number-container">
                        <p>${statistics.win_loose_ratio}</p>
                    </div>
                </div>
                <div class="info">
                    <p>${getString("statistics/gamesLose")}</p>
                    <div class="number-container">
                        <p>${statistics.total_loose}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function createRankContainer(rank, rankPoints) {
    return `
			<div class="rank-container rank-container-${rank}">
				<div class="rank-container-content">					
					<div class="rank-logo rank-${rank}-logo"></div>
					<p class="rank-name rank-name-${rank}">${getString(`ranks/${rank}`)}</p>
					<div class="rank-elo-container">
						<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
						<p class="elo">${rankPoints}</p>
					</div>
					<div class="next-rank-infos">
						${createRankInfos(rank, rankPoints)}
					</div>
				</div>
			</div>
		`;
}

function createRankInfos(rank, rankPoints) {
    const rankPointsTarget = {
        bronze: [0, 999],
        silver: [1000, 2999],
        gold: [3000, 5999],
        diamond: [6000, 9999],
        master: 10000
    }

    if (rank === 'master')
        return `<p class="max-rank">${getString('ranks/maxRank')}</p>`;

    const innerBarPercentage = (rankPoints - rankPointsTarget[rank][0]) * 100 / (rankPointsTarget[rank][1] - rankPointsTarget[rank][0]);
    return `
			<p>${getString('ranks/nextRank')}</p>
			<div class="next-rank-percentage-bar">	
				<div class="inner-bar inner-bar-${rank}" style="width: ${innerBarPercentage}%"></div>
			</div>
			<div class="next-rank-elo">
				<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
				<p>${rankPointsTarget[rank][1] + 1}</p>
			</div>
		`;
}


async function fillUserInfos(userInfos) {
    document.querySelector('.user-info > img').src = getProfileImage(userInfos);
    document.querySelector('.username').textContent = userInfos.username;
}

async function displayButtons(userInfos) {
    const friends_status = await checkFriendshipStatus();
    const divUserContent = document.querySelector('.users-profile-content');

    if (friends_status)
        divUserContent.innerHTML += `<friendship-button-component button-status=${friends_status}></friendship-button-component>`;

    if (await isOneself(userInfos.id) === false)
        divUserContent.innerHTML +=  '<user-profile-send-message-btn></user-profile-send-message-btn>';
}

async function checkFriendshipStatus() {
    const targetUsername = localStorage.getItem('users-profile-target-username');
    const url = `/api/friends/friendship_status/?q=${targetUsername}`

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

async function isOneself(targetUserId) {
    const userId = await getUserId();

    return userId === targetUserId;
}
