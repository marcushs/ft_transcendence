import {getString} from "../../../../utils/languageManagement.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import getUserData from "../../../../utils/getUserData.js";
import '../inGame/inGameComponent.js'
import { gameWebsocket } from "../inGame/gameWebsocket.js";

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
		const userData = await getUserData();
		if (!userData)
			return;
		console.log('userdata: ', userData);
		
		gameWebsocket(userData.id);
		if (!this.requestMatchmakingResearch())
			return;
	}

	async requestMatchmakingResearch() {
		try {
			const data = await sendRequest('POST', 'http://localhost:8006/matchmaking/matchmaking/', {type: 'unranked'});
			console.log('matchmaking successfully launched - back response : ', data);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}

customElements.define('unranked-component', UnrankedComponent);