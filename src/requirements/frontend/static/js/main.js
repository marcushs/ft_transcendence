import login from "./views/login.js";
import index from "./views/index.js";
import signup from "./views/signup.js";
import LogoutFormHandler from "./views/logout.js";

const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
};

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
