import profile from "../views/profile.js";
import login from "../views/login.js";
import logout from "../views/logout.js";
// import userProfile from "../views/user-profile.js";


export function handleRedirection(redirection, username=null) {
    if (app) {
        app.innerHTML = '';
        // if (username)
        //     history.pushState("", "", `/users/${username}`);
        // else
        history.pushState("", "", `/${redirection}`);
        switch (redirection) {
            case 'profile':
                app.innerHTML = profile();
                break;
            // case 'users-profile':
            //     app.innerHTML = userProfile();
            //     break;
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