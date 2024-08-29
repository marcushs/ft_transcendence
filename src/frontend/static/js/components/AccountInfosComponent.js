import {throwRedirectionEvent} from "../utils/throwRedirectionEvent.js";

class AccountInfosComponent extends HTMLElement {
	constructor() {
		super();

		this.initializeComponent();
		this.isOpen = false;
		this.username = null;
		this.profilePictureSrc = null;
	}


	initializeComponent() {
		this.innerHTML = `
            <div class="account-infos" id="loggedUser">
                <p>${this.getAttribute('username')}</p>
				<img src="${this.getAttribute('profile-picture')}" class="profile-picture"/>
			</div>
			<div class="account-menu-background">			
		         <ul>
	                <li>
	                    <p>Profile</p>
	                </li>
	                <li>
	                    <p>Logout</p>
	                </li>
	            </ul>
			</div>
		`;
	}


	connectedCallback() {
		this.attachEventsListener();
	}


	attachEventsListener() {
		this.querySelector('.account-infos').addEventListener('click', event => this.handleClickOnAccountInfos());

		this.querySelector('ul li:first-child p').addEventListener('click', () => throwRedirectionEvent('/profile'));
		this.querySelector('ul li:last-child p').addEventListener('click', () => throwRedirectionEvent('/logout'));

		document.addEventListener('closeAccountInfosComponent', () => this.closeMenu());

		this.addEventListener('click', event => event.stopPropagation());
		document.addEventListener('click', () => this.handleClickOutOfComponent());
	}


	// Handler

	handleClickOutOfComponent() {
		if (this.isOpen)
			this.closeMenu();
	}


	handleClickOnAccountInfos() {
		if (this.isOpen) {
			this.closeMenu();
		} else {
			this.closeOtherNavBarComponent();
			this.openMenu();
		}
	}


	// Throw events

	throwCloseChooseLanguageComponentEvent() {
		const event = new CustomEvent('closeChooseLanguageComponent', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	throwCloseNotificationsContainerEvent() {
		const event = new CustomEvent('closeNotificationsContainer', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}


	// Animations

	closeMenu() {
		const menu = this.querySelector('.account-menu-background');

		menu.style.animation = 'decreaseAccountMenuHeight 0.3s ease forwards';
		menu.querySelectorAll('p').forEach((elem) => {
			elem.style.animation = 'reduceTextOpacity 0.1s ease forwards';
		});
		this.isOpen = !this.isOpen;
	}

	openMenu() {
		const menu = this.querySelector('.account-menu-background');

		menu.style.display = 'block';
		menu.querySelectorAll('p').forEach((elem) => {
			elem.style.animation = 'augmentTextOpacity 0.35s ease forwards';
		});
		menu.style.animation = 'increaseAccountMenuHeight 0.3s ease forwards';
		this.isOpen = !this.isOpen;
	}


	closeOtherNavBarComponent() {
		const languageMenu = document.querySelector('.language-list');
		const notificationsMenu = document.querySelector('.notifications-container-background');

		if (getComputedStyle(languageMenu).display !== 'none')
			this.throwCloseChooseLanguageComponentEvent();
		if (getComputedStyle(notificationsMenu).display !== 'none')
			this.throwCloseNotificationsContainerEvent();
	}

}

customElements.define('account-infos-component', AccountInfosComponent);
