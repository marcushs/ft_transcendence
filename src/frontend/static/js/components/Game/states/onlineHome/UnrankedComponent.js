import {getString} from "../../../../utils/languageManagement.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import getUserData from "../../../../utils/getUserData.js";
import { waitForOpenWebsocketConnection } from "../inGame/gameWebsocket.js";
import '../inGame/inGameComponent.js'
import { gameWebsocket } from "../inGame/gameWebsocket.js";
import '../../MatchmakingResearchComponent.js'
import { matchmakingWebsocket, matchmakingSocket } from "../../matchmakingWebsocket.js";

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
			if (!this.requestMatchmakingResearch()) {
				if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
					matchmakingSocket.close();
				return;
			}
			localStorage.setItem('isSearchingGame', 'unranked');
			const researchComponent = document.createElement('matchmaking-research-component');
			app.appendChild(researchComponent);
		} catch (error) {
			console.error(error);
		}
	}

	async requestMatchmakingResearch() {
		try {
			const response = await sendRequest('POST', 'http://localhost:8006/matchmaking/matchmaking/', {type: 'unranked'}); 
			console.log(response.message);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}

customElements.define('unranked-component', UnrankedComponent);