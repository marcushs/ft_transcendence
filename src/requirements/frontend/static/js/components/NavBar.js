import "./SearchBar.js"
import checkAuthentication from '../utils/checkAuthentication.js'
import getUserInfos from "../utils/getUserInfos.js";
import signup from "../views/signup.js";
import login from "../views/login.js";

class NavBarComponent extends HTMLElement {

    constructor() {
        super();

        this.innerHTML = `
            <nav>
                <div class="nav-bar-section nav-bar-left-section">
                    <div class="logo"></div>
                    <a class="nav-bar-link">Home</a>
                    <div is="search-bar-component"></div>
                </div>
                <div class="nav-bar-section nav-bar-right-section">
                
                </div>
            </nav>
        `;
        this.classList.add('component');
    }

    connectedCallback() {
        this.generateNavBarRightSection();
    }

    generateAnonymousUser() {
        return `
            <div class="account-infos">
                <button-component label="Login" class="login-nav-bar-btn"></button-component>
                <button-component label="Signup" class="signup-nav-bar-btn"></button-component>
            </div>
        `;
    }

    async generateNavBarRightSection() {
        if (await checkAuthentication()) {
            this.querySelector('.nav-bar-right-section').innerHTML = await this.generateUserInfos();
        } else {
            this.querySelector('.nav-bar-right-section').innerHTML = this.generateAnonymousUser();
            this.querySelector('.login-nav-bar-btn').addEventListener('click', () => this.handleAuthenticationRedirection('login'));
            this.querySelector('.signup-nav-bar-btn').addEventListener('click', () => this.handleAuthenticationRedirection('signup'));
        }
    }
    async generateUserInfos() {
        const userData = await getUserInfos();

        return `
            <img src="../../assets/bell.svg" alt="notifs-bell">
            <div class="account-infos">
                <p>${userData.user.username}</p>
                <img src="${userData.user.profile_image}" class="profile-picture" alt="Profile picture">
            </div>
        `;
    }

    handleAuthenticationRedirection(redirection) {
        history.replaceState('', '', `/${redirection}`);
        if (redirection === 'signup') {
            app.innerHTML = signup();
        } else {
            app.innerHTML = login();
        }
    }
}

customElements.define('nav-bar-component', NavBarComponent);