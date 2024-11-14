import {getString} from "../../../../utils/languageManagement.js";
import {sendRequest} from "../../../../utils/sendRequest.js";
import {matchmakingWebsocket, matchmakingSocket} from "../../../../utils/matchmaking/matchmakingWebsocket.js";
import {gameSocket, gameWebsocket} from "../inGame/gameWebsocket.js";
import getUserId from "../../../../utils/getUserId.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
				<div class="btn-container">
					<button-component id="genericBtn" label="${getString('buttonComponent/invite')}" class="generic-btn-disabled"></button-component>
					<button-component id="leaveBtn" label="${getString('buttonComponent/leave')}" class="generic-btn-cancel" style="display: none"></button-component>
				</div>
				<p class="invite-player-field-error"></p>
				<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel" style="visibility: hidden">
				<img src="../../../../../assets/accept_icon_green.png" alt="accept icon" class="accept-icon" style="visibility: hidden">
			</div>
		`;

		this.attachEventsListener();
		this.state = "initial";
	}

	attachEventsListener() {
		const input = this.querySelector('input');
		const genericBtn = this.querySelector('#genericBtn');
		const leaveBtn = this.querySelector('#leaveBtn');

		genericBtn.addEventListener('click', async () => {
			await this.handlePlayButtonClick(genericBtn);
		});

		input.addEventListener('input', () => {
			this.resetError();
			if (input.value !== '')
				genericBtn.className = "generic-btn";
			else
				genericBtn.className = "generic-btn-disabled";
		});

		leaveBtn.addEventListener('click', async () => {
			await this.handleLeaveLobby();
		});

		document.addEventListener('playerJoinedMatchEvent', () => {
			this.state = "ready";
			this.displayLobby();
			localStorage.setItem("isReadyToPlay", "true");
		});

	}


	async connectedCallback() {
		const isSearchingPrivateMatch = localStorage.getItem("isSearchingPrivateMatch");
		const isReadyToPlay  = localStorage.getItem("isReadyToPlay");

		if (isReadyToPlay) {
			this.displayLobby();
			this.state = "ready";
		} else if (isSearchingPrivateMatch) {
			await matchmakingWebsocket();
			this.displayWaitingState();
			this.querySelector('input').value = isSearchingPrivateMatch;
			this.state = "waiting";
		}
	}


	async handlePlayButtonClick(button) {
		const input = this.querySelector('input');

		console.log(this.state)
		if (input.value !== '' && this.state === "initial" && button.className === "generic-btn")
			await this.handleInitialStateClick(input.value);
		else if (input.value !== '' && this.state === "waiting")
			await this.handleWaitingStateClick(input.value);
		else if (input.value !== '' && this.state === "ready")
			await this.handleReadyStateClick();
	}


	async handleInitialStateClick(username) {
		try {
			const data = await sendRequest("POST", "/api/matchmaking/init_private_match/", {
				invitedUsername: username,
			});
			await matchmakingWebsocket();
			this.displayWaitingState();
			this.state = "waiting";
			localStorage.setItem("isSearchingPrivateMatch", username);
		} catch (error) {
			console.log('private_match: ', error.message);
		}
	}


	async handleWaitingStateClick(username) {
		try {
			const input = this.querySelector('input');

			input.value = "";
			input.disabled = false;
			this.querySelector('#genericBtn button').innerText = getString("buttonComponent/invite");
			this.changeButtonClassname("generic-btn-disabled");
			this.querySelector('.loading-wheel').style.visibility = "hidden";
			this.state = "initial";
			localStorage.removeItem("isSearchingPrivateMatch");

			const data = await sendRequest("POST", "/api/matchmaking/cancel_private_match/", { invitedUsername: username });
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();

		} catch (error) {
			console.log('private_match: ', error.message);
		}
	}


	async handleReadyStateClick() {
		try {
			const input = this.querySelector('input');

			// this.querySelector('.loading-wheel').style.visibility = "hidden";
			// this.state = "initial";
			// localStorage.removeItem("isSearchingPrivateMatch");
			//
			const data = await sendRequest("POST", "/api/matchmaking/start_private_match/", { invitedUsername: input.value });
			console.log('should launch')
			await gameWebsocket(await getUserId());
			// if (gameSocket && gameSocket.readyState !== WebSocket.OPEN)
			// 	await gameWebsocket();

		} catch (error) {
			console.log('private_match: ', error.message);
		}
	}


	async handleLeaveLobby() {
		const username = localStorage.getItem("isSearchingPrivateMatch");

		console.log(username)
		try {
			const data = await sendRequest("POST", "/api/matchmaking/cancel_private_match/", { invitedUsername: username });
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		} catch (error) {
			console.log('private_match: ', error.message);
		}
	}


	displayWaitingState() {
		this.querySelector('.loading-wheel').style.visibility = "visible";
		this.querySelector('#genericBtn button').innerHTML = getString("buttonComponent/cancel");
		this.querySelector('input').disabled = true;
		this.changeButtonClassname("generic-btn-cancel");
	}


	displayLobby() {
		this.querySelector('.loading-wheel').style.visibility = "hidden";
		this.querySelector('.accept-icon').style.visibility = "visible";
		this.querySelector('#genericBtn button').innerHTML = getString("buttonComponent/play");
		this.querySelector('input').disabled = true;
		this.querySelector('input').value = localStorage.getItem("isSearchingPrivateMatch");
		this.changeButtonClassname("generic-btn");
		this.querySelector('#leaveBtn').style.display = "block";
	}


	changeButtonClassname(newClass) {
		this.querySelector('#genericBtn').className = newClass;
		this.querySelector('#genericBtn button').className = newClass;
	}


	resetError() {
		this.querySelector('.invite-player-field-error').innerHTML = '';
	}

}

customElements.define('private-match-component', PrivateMatchComponent);