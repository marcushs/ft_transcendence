// async function getData() {
//     // try {
//     //     const res = await fetch('http://localhost:8000/account/login');
//     //     const data = await res.json();
//     //     console.log(data);
//     // } catch (error) {
//     //     console.error('Network error:', error);
//     //     // Handle the error, such as displaying an error message to the user
//     // }
//     const config = {
//         headers: {
//             'Accept': 'application/json'
//         }
//     }

//     const res = await fetch('http://localhost:8000/account/login', config)

//     const data = await res.json()

//     console.log(data.message)
// }

import login from "./views/login.js";
import index from "./views/index.js";
import signup from "./views/signup.js";

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
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
