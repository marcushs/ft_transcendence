import home from "./views/home.js";
import login from "./views/login.js";
import signup from "./views/signup.js";
import logout from "./views/logout.js"
import profile from "./views/profile.js";
import userProfile from "./views/user-profile.js";
import changePassword from "./views/change-password.js";
import { generateCsrfToken } from "./utils/cookie.js";
import enableTwoFactor from './views/two_factor/TwoFactorAuthEnable.js';
import disableTwoFactor from './views/two_factor/TwoFactorAuthDisable.js';

const routes = {
    "/": { title: "Home", render: home },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/logout": { title: "Logout", render: logout },
    "/change-password": { title: "Change password", render: changePassword },
    "/profile": { title: "Profile", render: profile },
    "/twofactor/enable": { title: "EnableTwoFactor", render: enableTwoFactor },
    "/twofactor/disable": { title: "DisableTwoFactor", render: disableTwoFactor }
};

// create the csrf token if it does not already exist
generateCsrfToken();
function router() {
    let view = routes[location.pathname];

    console.log('test');
    if (handleDynamicURL())
        return;
    if (view) {
        document.title = view.title;
        app.innerHTML = view.render();
    } else {
        history.replaceState("", "", "/");
        router();
    }
};

function handleDynamicURL() {
    const path = window.location.pathname;
    const segments = path.split('/');
    if (segments.length > 2 && segments[1] === 'users') {
        const username = segments[2];
        document.title = username + '-profile';
        app.innerHTML = userProfile();
        localStorage.setItem('users-profile-target-username', username);
        // userProfile();
        // new DisplayUserProfile(username);
        return true;
    }
    return false;
}

// Handle navigation
window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});


// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
