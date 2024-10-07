import {getString} from "../../../../utils/languageManagement.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import getUserData from "../../../../utils/getUserData.js";
import '../inGameComponent.js'

let socket = null;
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
		
		this.startGameWebsocket(userData.id);
		if (!this.requestMatchmakingResearch())
			return;
	}

	async startGameWebsocket(userId) {
		if (socket !== null) {
			socket.close();
		}

		socket = new WebSocket(`ws://localhost:8005/ws/game/?user_id=${userId}`);

		socket.onopen = () => {
			console.log('Connected to game websocket');
		}

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data)
			console.log('data received from game websocket : ', data);
			if (data.type === 'game_starting')
				this.startGame()
		}

		socket.onclose = () => {
			console.log('Disconnected from game websocket');
		}
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

	async startGame() {
		const onlineHomeDiv = document.querySelector('.online-home-container');
		const oldDivContent = onlineHomeDiv.innerHTML;

		onlineHomeDiv.innerHTML = '<in-game-component></in-game-component>'
	}

}

customElements.define('unranked-component', UnrankedComponent);