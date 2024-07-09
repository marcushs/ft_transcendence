import "./SearchBar.js"
import checkAuthentication from '../utils/checkAuthentication.js'
import getProfileImage from "../utils/getProfileImage.js";
import getUserData from "../utils/getUserData.js";
import signup from "../views/signup.js";
import login from "../views/login.js";
import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";

class NavBarComponent extends HTMLElement {

    constructor() {
        super();

        this.initializeComponent();
    }


    initializeComponent() {
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
        typeAndReplaceWords();
    }


    async generateNavBarRightSection() {
        if (await checkAuthentication()) {
            this.querySelector('.nav-bar-right-section').innerHTML = await this.generateLoggedUserInfos();
        } else {
            this.querySelector('.nav-bar-right-section').innerHTML = this.generateUnloggedUserInfos();
            this.querySelector('.login-nav-bar-btn').addEventListener('click', () => this.handleAuthenticationRedirection('login'));
            this.querySelector('.signup-nav-bar-btn').addEventListener('click', () => this.handleAuthenticationRedirection('signup'));
        }
    }


    async generateLoggedUserInfos() {
        const userData = await getUserData();
        const profilePicture = document.createElement('img');

        profilePicture.className = 'profile-picture';
        profilePicture.src = getProfileImage(userData);

        return `
            <img src="../../assets/bell.svg" alt="notifs-bell">
            <div class="account-infos">
                <p>${userData.username}</p>
                ${profilePicture.outerHTML}
            </div>
        `;
    }


    generateUnloggedUserInfos() {
        return `
            <div class="account-infos">
                <button-component label="Login" class="login-nav-bar-btn"></button-component>
                <button-component label="Signup" class="signup-nav-bar-btn"></button-component>
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