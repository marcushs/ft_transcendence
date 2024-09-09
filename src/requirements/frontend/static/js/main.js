import home from "./views/home.js";
import login from "./views/login.js";
import signup from "./views/signup.js";
import logout from "./views/logout.js"
import profile from "./views/profile.js";
import changePassword from "./views/change-password.js";
import { generateCsrfToken } from "./utils/cookie.js";
import enableTwoFactor from './views/two_factor/TwoFactorAuthEnable.js';
import disableTwoFactor from './views/two_factor/TwoFactorAuthDisable.js';
import oauthRedirect from './views/oauthRedirect.js';
import oauthUsername from "./views/oauthUsername.js";
import chatRoom from "./views/chatRoom.js";

const routes = {
    "/": { title: "Home", render: home },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/logout": { title: "Logout", render: logout },
    "/change-password": { title: "Change password", render: changePassword },
    "/profile": { title: "Profile", render: profile },
    "/twofactor/enable": { title: "EnableTwoFactor", render: enableTwoFactor },
    "/twofactor/disable": { title: "DisableTwoFactor", render: disableTwoFactor },
    "/oauth-redirect": { title: "OauthRedirect", render: oauthRedirect },
    "/oauth-username": { title: "OauthUsername", render: oauthUsername},
    "/chatroom": { title: "chatRoom", render: chatRoom},
};

// create the csrf token if it does not already exist
generateCsrfToken();
function router() {
    let view = routes[location.pathname];

    if (view) {
        // console.log(view);
        document.title = view.title;
        app.innerHTML = view.render();
    } else {
        history.replaceState("", "", "/");
        router();
    }
};

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
