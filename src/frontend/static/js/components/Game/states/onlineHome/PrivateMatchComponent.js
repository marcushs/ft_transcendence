import {getString} from "../../../../utils/languageManagement.js";
import {sendRequest} from "../../../../utils/sendRequest.js";
import {matchmakingWebsocket, matchmakingSocket} from "../../../../utils/matchmaking/matchmakingWebsocket.js";

class PrivateMatchComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="private-match-component-content">
				<h4>${getString('gameComponent/privateMatch')}</h4>
				<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
				<button-component label="${getString('buttonComponent/invite')}" class="generic-btn-disabled"></button-component>
				<p class="invite-player-field-error"></p>
				<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel" style="visibility: hidden">
			</div>
		`;

		this.attachEventsListener();
		this.state = "initial";
	}

	attachEventsListener() {
		const input = this.querySelector('input');
		const button = this.querySelector('button-component');

		button.addEventListener('click', async () => {
			await this.handlePlayButtonClick(button);
		});

		input.addEventListener('input', () => {
			this.resetError();
			if (input.value !== '')
				button.className = "generic-btn";
			else
				button.className = "generic-btn-disabled";
		});


		// document.addEventListener('playerJoinedMatchEvent', () => {
		// 	alert('test')
		// });

	}


	async connectedCallback() {
		const isSearchingPrivateMatch = localStorage.getItem("isSearchingPrivateMatch");

		if (isSearchingPrivateMatch) {
			await matchmakingWebsocket();
			this.displayWaitingState();
			this.querySelector('input').value = isSearchingPrivateMatch;
			this.state = "waiting";
		}
	}


	async handlePlayButtonClick(button) {
		const input = this.querySelector('input');

		if (input.value !== '' && this.state === "initial" && button.className === "generic-btn")
			await this.handleInitialStateClick(input.value);
		else if (input.value !== '' && this.state === "waiting")
			await this.handleWaitingStateClick(input.value);
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

			const data = await sendRequest("POST", "/api/matchmaking/cancel_private_match/", { invitedUsername: username });
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();

			input.value = "";
			input.disabled = false;
			this.querySelector('button-component button').innerText = getString("buttonComponent/invite");
			this.changeButtonClassname("generic-btn-disabled");
			this.querySelector('img').style.visibility = "hidden";
			this.state = "initial";
			localStorage.removeItem("isSearchingPrivateMatch");
		} catch (error) {
			console.log('private_match: ', error.message);
		}
	}


	displayWaitingState() {
		this.querySelector('img').style.visibility = "visible";
		this.querySelector('button-component button').innerHTML = getString("buttonComponent/cancel");
		this.querySelector('input').disabled = true;
		this.changeButtonClassname("generic-btn-cancel");
		// this.querySelector('button-component').remove();


		// this.querySelector('.private-match-component-content').innerHTML = `
		// 		<h4>${getString('gameComponent/privateMatch')}</h4>
		// 		<input type="text" placeholder="${getString('gameComponent/playerName')}" maxlength="12">
		// 		<button-component label="${getString('buttonComponent/cancel')}" class="generic-btn"></button-component>
		// 		<p class="invite-player-field-error"></p>
		// 		<img src="../../../../../assets/loading-wheel.svg" alt="loading wheel" class="loading-wheel" style="visibility: hidden">
		// 	`;



	}


	displayLobby() {

	}


	changeButtonClassname(newClass) {
		this.querySelector('button-component').className = newClass;
		this.querySelector('button-component button').className = newClass;
	}


	resetError() {
		this.querySelector('.invite-player-field-error').innerHTML = '';
	}

}

customElements.define('private-match-component', PrivateMatchComponent);