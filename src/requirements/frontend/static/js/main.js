import home from "./views/home.js";
import login from "./views/login.js";
import signup from "./views/signup.js";
import logout from "./views/logout.js"
import profile from "./views/profile.js";
import changePassword from "./views/change-password.js";
import { generateCsrfToken } from "./utils/cookie.js";
import enableTwoFactor from './views/two_factor/TwoFactorAuthEnable.js';
import twoFactorApp from "./views/two-factor-app.js";
import twoFactorEmail from "./views/two-factor-email.js";
import checkAuthentication from "./utils/checkAuthentication.js";
import twoFactorDeactivation from "./views/two-factor-deactivation.js";

// (async () => {
//     if (await isTwoFactorActivated()) {
//         localStorage.setItem('isTwoFactorActivated', 'true');
//         localStorage.setItem('twoFactorMethod', await getTwoFactorMethod());
//     } else {
//         localStorage.setItem('isTwoFactorActivated', 'false');
//         localStorage.removeItem('twoFactorMethod');
//     }
// })();

const routes = {
    "/": { title: "Home", render: home },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/logout": { title: "Logout", render: logout },
    "/change-password": { title: "Change password", render: changePassword },
    "/profile": { title: "Profile", render: profile },
    "/two-factor-app": { title: "TwoFactorApp", render: twoFactorApp },
    "/two-factor-email": { title: "TwoFactorEmail", render: twoFactorEmail },
    "/two-factor-deactivation": { title: "TwoFactorDeactivate", render: twoFactorDeactivation },
};

// create the csrf token if it does not already exist
generateCsrfToken();
async function router() {
    let view = routes[location.pathname];

    if (!view || !await isViewAccessible(location.pathname)) {
        history.replaceState("", "", localStorage.getItem('lastAuthorizedPage'));
        view = routes[localStorage.getItem('lastAuthorizedPage')];
    }

    document.title = view.title;
    app.innerHTML = view.render();
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
        history.replaceState("", "", e.detail.route); // To reload components without reload the whole page
    router();
});


// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
