import { sendMatchSearchRequest } from "../../../../utils/matchmaking/matchResearch.js";
import { getString } from "../../../../utils/languageManagement.js";
import '../../../Matchmaking/MatchmakingResearchComponent.js'

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

	async handlePlayButtonClick() {
		sendMatchSearchRequest('unranked');
	}
}

customElements.define('unranked-component', UnrankedComponent);