import login from "./views/login.js";
import index from "./views/index.js";
import signup from "./views/signup.js";
import LogoutFormHandler from "./views/logout.js";
import { getCookie ,generateCsrfToken } from "./utils/cookie.js";
import profile from "./views/profile.js";

const routes = {
    "/": { title: "Index", render: index },
    "/login": { title: "Login", render: login },
    "/signup": { title: "Signup", render: signup },
    "/profile": { title: "Profile", render: profile },
};

// create the csrf token if it does not already exist
generateCsrfToken();

// if (location.pathname === "/admin") {
//     const config = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
//         },
//         credentials: 'include' // Needed for send cookie
//     };
//     try {
//         const res = await fetch('http://localhost:8000/admin/', config);
//         const data = await res.json();
//     } catch (error) {
//         console.log('Catch error :', error);
//         // alert(`Error: ${error.message}`)
//     }
// }

// if (location.pathname === "/2fa") {
//     console.log('test')
//     const config = {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCookie('csrftoken'), // Protect from csrf attack
//         },
//         credentials: 'include' // Needed for send cookie
//     };
//     try {
//         const res = await fetch('http://localhost:8000/2fa/', config);
//         const data = await res.json();
//     } catch (error) {
//         console.log('Catch error :', error);
//         // alert(`Error: ${error.message}`)
//     }
// }

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
