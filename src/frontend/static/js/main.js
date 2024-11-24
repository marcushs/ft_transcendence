import home from "./views/home.js";
import login from "./views/login.js";
import signup from "./views/signup.js";
import logout from "./views/logout.js"
import profile from "./views/profile.js";
import userProfile from "./views/user-profile.js";
import changePassword from "./views/change-password.js";
import { generateCsrfToken } from "./utils/cookie.js";
import twoFactorApp from "./views/two-factor-app.js";
import twoFactorEmail from "./views/two-factor-email.js";
import checkAuthentication from "./utils/checkAuthentication.js";
import twoFactorDeactivation from "./views/two-factor-deactivation.js";
import { isTwoFactorActivated } from "./utils/isTwoFactorActivated.js";
import { loadLanguagesJson } from "./utils/languageManagement.js";
import { checkInactiveGame } from "./components/Game/states/inGame/gameNetworkManager.js";
import { getTwoFactorMethod } from "./utils/getTwoFactorMethod.js";
import { PingStatus } from "./views/pingStatus.js";
import { unloadManager } from "./utils/unloadManager.js";
import { loadWebSocket } from "./views/websocket/loadWebSocket.js";
import oauthRedirect from './views/oauthRedirect.js';
import oauthUsername from "./views/oauthUsername.js";
import { checkMatchmakingSearch } from "./utils/matchmaking/matchResearch.js";
import disableButtonsInGameResearch from "./utils/disableButtonsInGameResearch.js";
import {throwRedirectionEvent} from "./utils/throwRedirectionEvent.js";
import TournamentMatch from "./components/Game/states/tournamentHome/TournamentMatch.js";
import { sendRequest } from "./utils/sendRequest.js";
import {manageGameStates} from "./utils/manageGameStates.js";
import {resetLocalStorage} from "./utils/resetLocalStorage.js";

let languageJson;

localStorage.setItem('lastAuthorizedPage', '/');

const routes = {
    "/": { render: home },
    "/login": { render: login },
    "/signup": { render: signup },
    "/logout": { render: logout },
    "/change-password": { render: changePassword },
    "/profile": { render: profile },
    "/two-factor-app": { render: twoFactorApp },
    "/two-factor-email": { render: twoFactorEmail },
    "/two-factor-deactivation": { render: twoFactorDeactivation },
    "/oauth-redirect": { render: oauthRedirect },
    "/oauth-username": { render: oauthUsername},
};

setUserRender();


async function router() {
    await resetLocalStorage();

    if (!languageJson)
        languageJson = await loadLanguagesJson();

    let view = routes[location.pathname];

	if (handleDynamicURL())
		return;

    if (!view || !await isViewAccessible(location.pathname)) {
        const lastAuthorizedPage = localStorage.getItem('lastAuthorizedPage');
        const newView = isViewAccessible(lastAuthorizedPage) ? lastAuthorizedPage : "/";

        history.replaceState("", "", newView);
        view = routes[newView];
    }

    app.innerHTML = await view.render();
    await checkInactiveGame();
    await checkMatchmakingSearch();
    manageGameStates();
}

function handleDynamicURL() {
    const path = window.location.pathname;
    const segments = path.split('/');
    if (segments.length > 2 && segments[1] === 'users') {
	    const username = segments[2];
	    localStorage.setItem('users-profile-target-username', username);
	    app.innerHTML = userProfile();
        localStorage.setItem('lastAuthorizedPage', location.pathname);
	    return true;
    }
	return false;
}

async function isViewAccessible(view) {
    const isUserConnected = await checkAuthentication();
    const loggedOutViews = ['/login', '/signup'];
    const loggedInViews = ['/change-password', '/profile', '/two-factor-app', '/two-factor-email', '/two-factor-deactivation', '/logout'];
    const twoFactorEnableViews = ['/two-factor-deactivation'];
    const twoFactorDisableViews = ['/two-factor-app', '/two-factor-email'];

    if (loggedOutViews.includes(view)) {
        if (isUserConnected)
            return false;
    }
    if (loggedInViews.includes(view)) {
        if (!isUserConnected)
            return false;
        if (twoFactorEnableViews.includes(view) && localStorage.getItem('isTwoFactorActivated') === 'false') {
            return false;
        }
        if (twoFactorDisableViews.includes(view) && localStorage.getItem('isTwoFactorActivated') === 'true') {
            return false;
        }
    }
    if (view === '/' || view === '/profile')
        localStorage.setItem('lastAuthorizedPage', location.pathname);
    return true;
}

// Handle user connection
document.addEventListener("userLoggedIn", setUserRender)

// Handle game reconnection
document.addEventListener("inactiveGame", () => {
    const isRender = document.querySelector('game-inactivity-component');
    if (!isRender) {
        const gameInactivityComponent = document.createElement('game-inactivity-component');
        app.appendChild(gameInactivityComponent);
    }
})

document.addEventListener("matchmakingResearch", () => {
    const isRender = document.querySelector('matchmaking-research-component');
    if (!isRender) {
        const matchmakingResearchComponent = document.createElement('matchmaking-research-component');
        app.appendChild(matchmakingResearchComponent);
    }
})

// Handle reloading or quit app
window.addEventListener('beforeunload', unloadManager)

// Handle navigation
window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

window.addEventListener('redirection', e => {
    if (location.pathname !== e.detail.route)
        history.pushState("", "", e.detail.route);
    else
        history.replaceState("", "", e.detail.route);
    router();
});


// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);

async function setUserRender() {
    await generateCsrfToken();
    const isUserConnected = await checkAuthentication();

    if (isUserConnected) {
        console.log('User session');
        await loadWebSocket();
        await setTwoFactorUserData();
        new PingStatus();
    } else
        console.log('Guest session');
}

// set twoFactor needed data
async function setTwoFactorUserData() {
    if (await isTwoFactorActivated()) {
        localStorage.setItem('isTwoFactorActivated', 'true');
        localStorage.setItem('twoFactorMethod', await getTwoFactorMethod());
    } else {
        localStorage.setItem('isTwoFactorActivated', 'false');
        localStorage.removeItem('twoFactorMethod');
    }
}


(async() => {
    try {
        let res = await sendRequest('GET', '/api/tournament/get_tournament_state/', null);
        console.log('in arrow function get tournament state: ', res);
    } catch (error) {
        console.error(error.toString());
    }
})()