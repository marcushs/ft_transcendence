import rotatingGradient from "../../anim/rotatingGradient.js";
import './ProfileNavBarComponent.js'
import './UserInfosComponent.js'
import './PopUpComponent.js'

class ProfileComponent extends HTMLElement {

	constructor() {
		super();

		this.states = {
			"personalInformation": { context: "/personalInformation", state: '<user-infos-component></user-infos-component>' },
			"security": { context: "/security", state: '<h1>security</h1>' },
			// "statsAndRank": { context: "/statsAndRank", state: new onlineHome() },
		}

		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
            <div class="profile-component-background"></div>
			<div class="profile-component-content">
				<profile-nav-bar-component></profile-nav-bar-component>
                <div class="states-container"></div>
			</div>
		`;
	}


	connectedCallback() {
		this.statesContainer = this.querySelector('.states-container');
		this.pushNewState(this.states["personalInformation"].state);
		this.attachEventListener();

		rotatingGradient('profile-component', '#FF16C6', '#00D0FF');
		rotatingGradient('.profile-component-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.profile-component-content', '#2a001f', '#001f26');
	}


	attachEventListener() {
		this.addEventListener('click', (event) => {
			if (event.target.hasAttribute('state-redirect') || (event.target.parentElement.hasAttribute('state-redirect'))) {
				this.handleStateRedirection(event);
			}
		});
	}


	handleStateRedirection(event) {
		const statesArray = Object.entries(this.states);

		for (const stateItem of statesArray) {
			if (event.target.hasAttribute(stateItem[0]) || event.target.parentElement.hasAttribute(stateItem[0])) {
				this.changeState(stateItem[1].state, stateItem[1].context);
				break ;
			}
		}
	}


	pushNewState(state) {
		this.statesContainer.innerHTML = state;
	}


	removeCurrentState() {
		this.statesContainer.innerHTML = '';
	}


	changeState(state, context) {
		this.removeCurrentState();
		this.pushNewState(state);
	}
}

customElements.define('profile-component', ProfileComponent);