import profile from "../views/profile.js";
import login from "../views/login.js";
import logout from "../views/logout.js";
import signup from "../views/signup.js";
import twoFactor from "../views/two-factor-app.js";


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
            case 'two-factor':
                app.innerHTML = twoFactor();
            default:
                app.innerHTML = index();
                break;
        }
    }
}