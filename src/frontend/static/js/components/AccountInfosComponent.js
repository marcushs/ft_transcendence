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
	}


	handleClickOnAccountInfos() {
		if (this.isOpen) {
			// this.closeNotificationsComponent();
			// this.querySelector('.account-menu-background').style.display = 'none';
			this.querySelector('.account-menu-background').style.animation = 'decreaseAccountMenuHeight 0.3s ease forwards';
			this.querySelectorAll('.account-menu-background p').forEach((elem) => {
				elem.style.animation = 'reduceTextOpacity 0.1s ease forwards';
			})
			this.isOpen = !this.isOpen;
		} else {
			// if (this.isChooseLanguageComponentOpen)
			// 	this.throwCloseChooseLanguageComponentEvent();
			// this.openNotificationsComponent();
			this.querySelector('.account-menu-background').style.display = 'block';
			this.querySelectorAll('.account-menu-background p').forEach((elem) => {
				elem.style.animation = 'augmentTextOpacity 0.35s ease forwards';
			})
			this.querySelector('.account-menu-background').style.animation = 'increaseAccountMenuHeight 0.3s ease forwards';
			// this.querySelector('.account-menu-background').style.animation = 'block';
			this.isOpen = !this.isOpen;
		}
	}


}

customElements.define('account-infos-component', AccountInfosComponent);