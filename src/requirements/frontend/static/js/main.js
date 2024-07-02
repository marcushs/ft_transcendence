import login from "./views/login.js";
import signup from "./views/signup.js";
import enable2fa from "./views/two_factor/enable2fa.js";
// import LogoutFormHandler from "./views/logout.js";
import { getCookie ,generateCsrfToken } from "./utils/cookie.js";
import profile from "./views/profile.js";
import logout from "./views/logout.js"
import home from "./views/home.js";

const routes = {
    "/": { title: "Home", render: home },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/profile": { title: "Profile", render: profile },
    "/logout": { title: "Logout", render: logout },
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
