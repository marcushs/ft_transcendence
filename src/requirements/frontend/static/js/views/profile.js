import { getCookie } from "../utils/cookie.js";
import enableTwoFactor from "./two_factor/enable2fa.js"
import { disableTwoFactor } from "./two_factor/disable2fa.js"
import "../components/NavBarComponent.js"
import "../components/Profile/ProfileComponent.js"

export default () => {
    const html = `
        <section class="profile-page">
            <nav-bar-component></nav-bar-component>
            <div class="profile-main-section">
                <profile-component></profile-component>
            </div>
        </section>
    `;

    setTimeout(() => {
        // addStyleToView();
	}, 0);

    return html;
}
//
// function displayUserInformation (data) {
//     const container = document.getElementById('container');
//     let two_factor_inner = null;
//
//     if (data.is_verified) {
//         two_factor_inner = `
//             <a href=/2fa/backup id=backup>backup two_factor authentification</a>
//             <a href=/2fa/disable id=disable>disable two_factor authentification</a>
//         `
//     } else {
//         two_factor_inner = `
//             <a href=/2fa/enable id=enable>enable two_factor authentification</a>
//         `
//     }
//     container.innerHTML += `${two_factor_inner}`
//     twoFactorEventListener();
// }
// function addStyleToView() {
//     const cssLink = document.createElement('link');
//
//     cssLink.setAttribute('rel', 'stylesheet');
//     cssLink.setAttribute('href', '../../style/views/profile.css');
//     document.head.appendChild(cssLink);
// }
//
// function twoFactorEventListener () {
//     const container = document.getElementById('container');
//     container.addEventListener('click', async function(event) {
//         event.preventDefault();
//         switch (event.target.id) {
//             case 'enable':
//                 history.pushState("", "", event.target.href);
//                 app.innerHTML = enableTwoFactor();
//                 break;
//             case 'disable':
//                 disableTwoFactor();
//                 break;
//             case 'backup':
//                 backup2fa();
//                 break;
//         }
//     });
// }