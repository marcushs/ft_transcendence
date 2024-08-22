import "./SearchBar.js";
import './ChooseLanguageComponent.js';
import checkAuthentication from '../utils/checkAuthentication.js';
import getProfileImage from "../utils/getProfileImage.js";
import getUserData from "../utils/getUserData.js";
import signup from "../views/signup.js";
import login from "../views/login.js";
import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";
import {getString} from "../utils/languageManagement.js";

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
                    <a class="nav-bar-link">${getString('navBarComponent/home')}</a>
                    <div is="search-bar-component"></div>
                </div>
                <div class="nav-bar-section nav-bar-right-section"></div>
            </nav>
        `;
        this.classList.add('component');
    }


    async connectedCallback() {
        await this.generateNavBarRightSection();
        this.attachEventsListener();
    }


    attachEventsListener() {
        const logo = this.querySelector('.logo');
        const homeLink = this.querySelector('a');
        const profileElement = this.querySelector('#loggedUser');

        logo.addEventListener('click', (event) => throwRedirectionEvent('/'))
        homeLink.addEventListener('click', (event) => throwRedirectionEvent('/'));
        if (profileElement)
            profileElement.addEventListener('click', (event) => throwRedirectionEvent('/profile'));
        else {
            this.querySelector('button-component[label="login"]').addEventListener('click', (event) => throwRedirectionEvent('/login'));
            this.querySelector('button-component[label="signup"]').addEventListener('click', (event) => throwRedirectionEvent('/signup'));
        }
    }


    async generateNavBarRightSection() {
        if (await checkAuthentication()) {
            this.querySelector('.nav-bar-right-section').innerHTML = await this.generateLoggedUserInfos();
        } else {
            this.querySelector('.nav-bar-right-section').innerHTML = this.generateUnloggedUserInfos();
        }
    }


    async generateLoggedUserInfos() {
        const userData = await getUserData();
        const profilePicture = document.createElement('img');

        profilePicture.className = 'profile-picture';
        profilePicture.src = getProfileImage(userData);

        return `
            <choose-language-component></choose-language-component>
            <img src="../../assets/bell.svg" alt="notifs-bell">
            <div class="account-infos" id="loggedUser">
                <p>${userData.username}</p>
                ${profilePicture.outerHTML}
            </div>
        `;
    }


    generateUnloggedUserInfos() {
        return `
            <choose-language-component></choose-language-component>
            <div class="account-infos">
                <button-component label="login" class="login-nav-bar-btn"></button-component>
                <button-component label="signup" class="signup-nav-bar-btn"></button-component>
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