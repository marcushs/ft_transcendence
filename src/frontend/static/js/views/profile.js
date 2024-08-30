import "../components/NavBarComponent.js"
import "../components/Profile/ProfileComponent.js"
import { getCookie } from "../utils/cookie.js";
import "../components/NavBarComponent.js";

export default () => {
    const html = `
        <section class="profile-page">
            <nav-bar-component></nav-bar-component>
            <div class="profile-main-section">
                <profile-component state="personalInformation"></profile-component>
            </div>
			<contact-menu-component></contact-menu-component>
        </section>
    `;

    return html;
}