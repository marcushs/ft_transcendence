import {getString} from "../../../../utils/languageManagement.js";

class UnrankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="unranked-component-content">
				<h4>${getString('gameComponent/unranked')}</h4>
				<button-component label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
			</div>
		`;

		this.attachEventsListener();
	}

	attachEventsListener() {
		this.querySelector('button-component').addEventListener('click', () => {
			this.handlePlayButtonClick();
		})
	}

	handlePlayButtonClick() {
		// Do something
	}

}

customElements.define('unranked-component', UnrankedComponent);