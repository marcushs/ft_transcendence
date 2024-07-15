import login from './views/login.js';
import index from './views/index.js';
import signup from './views/signup.js';
import enableTwoFactor from './views/two_factor/TwoFactorAuthEnable.js'
import disableTwoFactor from './views/two_factor/TwoFactorAuthDisable.js'
import { generateCsrfToken } from './utils/cookie.js';
import profile from './views/profile.js';
import logout from './views/logout.js'

console.log('pathname', location.pathname);
const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/profile": { title: "Profile", render: profile },
    "/logout": { title: "Logout", render: logout },
    "/twofactor/enable": { title: "EnableTwoFactor", render: enableTwoFactor },
    "/twofactor/disable": { title: "DisableTwoFactor", render: disableTwoFactor },
};

// create the csrf token if it does not already exist
generateCsrfToken();
function router() {
    let view = routes[location.pathname];
    
    if (view) {
        console.log(view);
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
