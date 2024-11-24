import {getString} from "../../../../utils/languageManagement.js";
import {sendRequest} from "../../../../utils/sendRequest.js";
import {matchmakingWebsocket, matchmakingSocket} from "../../../../utils/matchmaking/matchmakingWebsocket.js";
import {gameSocket, gameWebsocket} from "../inGame/gameWebsocket.js";
import getUserId from "../../../../utils/getUserId.js";
import disableButtonsInGameResearch from "../../../../utils/disableButtonsInGameResearch.js";
import resetButtonsOnMatchmakingCanceled from "../../../../utils/resetButtonsOnMatchmakingCanceled.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
				<p class="waiting-sentence"></p>
				<p class="feedback-error"></p>
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

		document.addEventListener('matchmakingResearchCanceledEvent', () => {
			if (input.value !== '')
				genericBtn.className = "generic-btn"
		});

		genericBtn.addEventListener('click', async () => {
			await this.handlePlayButtonClick(genericBtn);
		});

		input.addEventListener('input', () => {
			this.resetError();
			if (input.value !== '' && !localStorage.getItem("isSearchingGame")) {
				genericBtn.className = "generic-btn";
				this.querySelector('.feedback-error').style.visibility = "hidden";
			}
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

		document.addEventListener('guestPrivateMatchEvent', (event) => {
			localStorage.setItem("isInGuestState", event.detail.ownerName);
			this.state = "guestState";
			this.displayLobbyAsGuest(event.detail.ownerName);
		});

		document.addEventListener('privateMatchCanceled', (event) => {
			this.redirectToInitialState();
		});

		document.addEventListener('waitingStateEvent', async (event) => {
			await matchmakingWebsocket();
			this.state = "waiting";
			localStorage.setItem("isSearchingPrivateMatch", event.detail.username);
			this.displayWaitingState(event.detail.username);
		});

	}


	async connectedCallback() {
		const isSearchingPrivateMatch = localStorage.getItem("isSearchingPrivateMatch");
		const isReadyToPlay  = localStorage.getItem("isReadyToPlay");
		const isInGuestState = localStorage.getItem("isInGuestState");

		if (isReadyToPlay) {
			await matchmakingWebsocket();
			this.displayLobby();
			this.state = "ready";
		} else if (isSearchingPrivateMatch) {
			await matchmakingWebsocket();
			this.displayWaitingState();
			this.querySelector('input').value = isSearchingPrivateMatch;
			this.state = "waiting";
		} else if (isInGuestState) {
			this.state = "guestState";
			await matchmakingWebsocket();
			await gameWebsocket(await getUserId());
			this.displayLobbyAsGuest(isInGuestState);
		}
	}


	async handlePlayButtonClick(button) {
		const input = this.querySelector('input');

		if (input.value !== '' && this.state === "initial" && button.className === "generic-btn")
			await this.handleInitialStateClick(input.value);
		else if (input.value !== '' && this.state === "waiting")
			await this.handleWaitingStateClick(input.value);
		else if (input.value !== '' && this.state === "ready")
			await this.handleReadyStateClick();
	}


	async handleInitialStateClick(username) {
		try {
			if (localStorage.getItem("isSearchingGame"))
				return;
			const data = await sendRequest("POST", "/api/matchmaking/init_private_match/", {
				invitedUsername: username,
			});
			await matchmakingWebsocket();
			this.displayWaitingState();
			this.state = "waiting";
			localStorage.setItem("isSearchingPrivateMatch", username);
		} catch (error) {
			this.querySelector('.feedback-error').style.visibility = "visible";
			this.querySelector('.feedback-error').textContent = getString(`gameComponent/${error.message}`);
			this.querySelector('#genericBtn').className = "generic-btn-disabled";
		}
	}


	async handleWaitingStateClick(username) {
		try {
			const input = this.querySelector('input');

			resetButtonsOnMatchmakingCanceled();
			this.cancelPrivateMatchLobby();
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
			this.redirectToInitialState();
		}
	}


	async handleReadyStateClick() {
		try {
			resetButtonsOnMatchmakingCanceled();
			const input = this.querySelector('input');
			const data = await sendRequest("POST", "/api/matchmaking/start_private_match/", { invitedUsername: input.value });
			await gameWebsocket(await getUserId());
			this.cancelPrivateMatchLobby();
			this.state = "initial";
			localStorage.removeItem("isSearchingPrivateMatch");
			localStorage.removeItem("isReadyToPlay");
			localStorage.removeItem("isInGuestState");
			this.displayInitialState();
		} catch (error) {
			this.redirectToInitialState();
		}
	}


	async handleLeaveLobby() {
		try {
			resetButtonsOnMatchmakingCanceled();
			const data = await sendRequest("POST", "/api/matchmaking/cancel_private_match/", null);
			this.cancelPrivateMatchLobby();
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
			this.state = "initial";
			localStorage.removeItem("isSearchingPrivateMatch");
			localStorage.removeItem("isReadyToPlay");
			localStorage.removeItem("isInGuestState");
			this.displayInitialState();
		} catch (error) {
			this.redirectToInitialState();
		}
	}

	redirectToInitialState() {
		this.state = "initial";
		localStorage.removeItem("isSearchingPrivateMatch");
		localStorage.removeItem("isReadyToPlay");
		localStorage.removeItem("isInGuestState");
		this.displayInitialState();
		this.cancelPrivateMatchLobby();
	}


	displayInitialState() {
		const genericBtn = this.querySelector('#genericBtn button');

		this.querySelector('.loading-wheel').style.visibility = "hidden";
		this.querySelector('.accept-icon').style.visibility = "hidden";
		if (genericBtn) {
			genericBtn.innerHTML = getString("buttonComponent/invite");
			genericBtn.style.display = "block";
		}
		this.querySelector('input').disabled = false;
		this.querySelector('input').value = '';
		this.changeButtonClassname("generic-btn-disabled");
		this.querySelector('#leaveBtn').style.display = "none";
		this.querySelector('.waiting-sentence').style.visibility = "hidden";
		this.querySelector('.feedback-error').style.visibility = "hidden";
	}


	displayWaitingState(opponentUsername) {
		const genericBtn = this.querySelector('#genericBtn button');

		disableButtonsInGameResearch();
		if (opponentUsername)
			this.querySelector('input').value = opponentUsername;
		this.querySelector('.loading-wheel').style.visibility = "visible";
		if (genericBtn)
			genericBtn.innerHTML = getString("buttonComponent/cancel");
		this.querySelector('input').disabled = true;
		this.changeButtonClassname("generic-btn-cancel");
		this.querySelector('.waiting-sentence').style.visibility = "hidden";
		this.querySelector('.feedback-error').style.visibility = "hidden";
	}


	displayLobby() {
		const genericBtn = this.querySelector('#genericBtn button');

		disableButtonsInGameResearch();
		this.querySelector('.loading-wheel').style.visibility = "hidden";
		this.querySelector('.accept-icon').style.visibility = "visible";
		if (genericBtn)
			this.querySelector('#genericBtn button').innerHTML = getString("buttonComponent/play");
		this.querySelector('input').disabled = true;
		this.querySelector('input').value = localStorage.getItem("isSearchingPrivateMatch");
		this.changeButtonClassname("generic-btn");
		this.querySelector('#leaveBtn').style.display = "block";
		this.querySelector('.waiting-sentence').style.visibility = "hidden";
		this.querySelector('.feedback-error').style.visibility = "hidden";
	}


	displayLobbyAsGuest(opponentName) {
		const genericBtn = this.querySelector('#genericBtn button');

		disableButtonsInGameResearch();
		this.querySelector('.loading-wheel').style.visibility = "hidden";
		this.querySelector('.accept-icon').style.visibility = "hidden";
		if (genericBtn)
			this.querySelector('#genericBtn button').style.display = "none";
		this.querySelector('input').disabled = true;
		this.querySelector('input').value = opponentName;
		this.querySelector('#leaveBtn').style.display = "block";
		this.querySelector('.waiting-sentence').style.visibility = "visible";
		this.querySelector('.feedback-error').style.visibility = "hidden";
		let i = 0;
		const intervalId = setInterval(() => {
			let dots = "";
			const waitingSentenceElem = this.querySelector('.waiting-sentence');

			for (let n = i % 4; n > 0; n--)
				dots += '.';
			i++;
			if (!waitingSentenceElem)
				clearInterval(intervalId);
			else
				waitingSentenceElem.innerHTML = `${getString("gameComponent/waitingSentence")}${dots}`;
		}, 300);
	}


	changeButtonClassname(newClass) {
		const genericBtn = this.querySelector('#genericBtn button');

		this.querySelector('#genericBtn').className = newClass;
		if (genericBtn)
			this.querySelector('#genericBtn button').className = newClass;
	}


	resetError() {
		this.querySelector('.invite-player-field-error').innerHTML = '';
	}

	cancelPrivateMatchLobby() {
		document.querySelector('#rankedGenericBtn').className = "generic-btn";
		document.querySelector('#unrankedGenericBtn').className = "generic-btn";
	}
}

customElements.define('private-match-component', PrivateMatchComponent);