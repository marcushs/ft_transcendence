import profile from "../views/profile.js";
import index from "../views/index.js";
import login from "../views/login.js";
import sinup from "../views/signup.js";
import logout from "../views/logout.js";


export function handleRedirection(redirection) {
    if (app) {
        app.innerHTML = '';
        history.pushState("", "", `/${redirection}`);
        switch (redirection) {
            case 'profile':
                app.innerHTML = profile();
                break;
            case 'login':
                app.innerHTML = login();
                break;
            case 'signup':
                app.innerHTML = signup();
                break;
            case 'logout':
                app.innerHTML = logout();
                break;
            default:
                app.innerHTML = index();
                break;
        }
    }
}