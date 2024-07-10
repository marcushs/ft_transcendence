import login from './views/login.js';
import index from './views/index.js';
import signup from './views/signup.js';
import enable2fa from './views/two_factor/TwoFactorAuthEnable.js'
import disable2fa from './views/two_factor/TwoFactorAuthDisable.js'
import { generateCsrfToken } from './utils/cookie.js';
import profile from './views/profile.js';
import logout from './views/logout.js'

console.log('pathname', location.pathname);
const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/login/verify": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/profile": { title: "Profile", render: profile },
    "/logout": { title: "Logout", render: logout },
    "/2fa/enable": { title: "Enable2FA", render: enable2fa },
    "/2fa/disable": { title: "Disable2FA", render: disable2fa },
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
