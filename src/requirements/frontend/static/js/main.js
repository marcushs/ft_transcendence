import login from "./views/login.js";
import index from "./views/index.js";
import signup from "./views/signup.js";
import enable2fa from "./views/two_factor/enable2fa.js";
import LogoutFormHandler from "./views/logout.js";
import { getCookie ,generateCsrfToken } from "./utils/cookie.js";
import profile from "./views/profile.js";

const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/profile": { title: "Profile", render: profile },
    "/2fa/enable": { title: "2fa", render: enable2fa },
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
    if (e.target.matches("[Logout]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        new LogoutFormHandler('app');
    }
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
