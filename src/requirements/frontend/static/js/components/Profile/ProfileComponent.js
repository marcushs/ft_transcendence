import rotatingGradient from "../../anim/rotatingGradient.js";
import './UserInfosComponent.js'
import './PopUpComponent.js'

class ProfileComponent extends HTMLElement {

	constructor() {
		super();

		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
            <div class="profile-component-background"></div>
			<div class="profile-component-content">
				<user-infos-component></user-infos-component>
				<div class="stats-infos-container"></div>
			</div>
		`;
	}


	connectedCallback() {
		console.log('test')
		rotatingGradient('profile-component', '#FF16C6', '#00D0FF');
		rotatingGradient('.profile-component-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.profile-component-content', '#1c0015', '#001519');
	}
}

customElements.define('profile-component', ProfileComponent);