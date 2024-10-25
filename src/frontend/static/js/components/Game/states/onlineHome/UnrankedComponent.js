import { matchmakingWebsocket, matchmakingSocket } from "../../matchmakingWebsocket.js";
import { requestMatchmakingResearch } from "../../MatchmakingResearchComponent.js";
import { getString } from "../../../../utils/languageManagement.js";
import '../../MatchmakingResearchComponent.js'
// import '../inGame/inGameComponent.js'

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
		try {
			await matchmakingWebsocket();			
			if (!requestMatchmakingResearch({type: 'unranked'})) {
				if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
					matchmakingSocket.close();
				return;
			}
			localStorage.setItem('isSearchingGame', JSON.stringify({
				type: 'unranked',
				status: 'searching'
			}));
			const researchComponent = document.createElement('matchmaking-research-component');
			app.appendChild(researchComponent);
		} catch (error) {
			console.error(error);
		}
	}
}

customElements.define('unranked-component', UnrankedComponent);