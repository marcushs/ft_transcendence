import login from "./views/login.js";
import index from "./views/index.js";
import signup from "./views/signup.js";
import LogoutFormHandler from "./views/logout.js";
import { getCookie, generateCsrfToken } from "./utils/cookie.js";

const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
};

// create the csrf token if it does not already exist
generateCsrfToken();

// test for jwt token security
if (location.pathname === '/protected') {
    try {
        const config = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Protect from csrf attack
            },
            credentials: 'include' // Needed for send cookie
        };
        const res = await fetch(`http://localhost:8000/account/protected/`, config);
        if (res.status == 403)
            throw new Error('Access Denied')
        const data = await res.json();
        if (!res.ok) {
            throw new Error(`${res.status} - ${data.error}`);
        }
        console.log('jwt user: ', data.user)
        alert(data.message)
    } catch (error) {
        console.log('Catch error :', error.data);
        if (error.message.indexOf("token expired")) {
            history.replaceState("", "", "/");
            document.title = "Login";
            app.innerHTML = login();
        }
        alert(`Error: ${error.message}`);
    }
}

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
