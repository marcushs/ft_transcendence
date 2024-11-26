import { sendMatchSearchRequest } from "../../../../utils/matchmaking/matchResearch.js";
import { getString } from "../../../../utils/languageManagement.js";
import '../../../Matchmaking/MatchmakingResearchComponent.js'
import disableButtonsInGameResearch from "../../../../utils/disableButtonsInGameResearch.js";
import resetButtonsOnMatchmakingCanceled from "../../../../utils/resetButtonsOnMatchmakingCanceled.js";

class UnrankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="unranked-component-content">
				<h4>${getString('gameComponent/unranked')}</h4>
				<button-component id="unrankedGenericBtn" label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
				<button-component label="${getString('buttonComponent/cancel')}" class="generic-btn-cancel" style="display: none"></button-component>
			</div>
		`;
	}


	connectedCallback() {
		this.playButton = this.querySelector('.generic-btn');
		this.cancelButton = this.querySelector('.generic-btn-cancel');

		const isSearchingGame = JSON.parse(localStorage.getItem('isSearchingGame'));

		if (isSearchingGame && isSearchingGame.type !== "unranked")
			this.playButton.className = "generic-btn-disabled";
		else if (isSearchingGame)
			this.replacePlayBtnByCancel();

		this.attachEventsListener();
	}


	attachEventsListener() {
		this.playButton.addEventListener('click', () => this.handlePlayButtonClick());
		this.cancelButton.addEventListener('click', () => this.handleCancelButtonClick());

		document.addEventListener('matchmakingResearchCanceledEvent', () => {
			this.cancelButton.style.display = 'none';
			this.playButton.style.display = 'flex';
			resetButtonsOnMatchmakingCanceled();
		});
	}


	async handlePlayButtonClick() {
		if (this.playButton.className !== "generic-btn")
			return ;
		this.replacePlayBtnByCancel();
		if (await sendMatchSearchRequest('unranked'))
			disableButtonsInGameResearch();
		else
			this.replaceCancelBtnByPlay();
		const genericBtn = document.querySelector('#genericBtn');
		genericBtn.className = "generic-btn-disabled";
	}

	async handleCancelButtonClick() {
		this.throwCancelMatchmakingResearchEvent();
	}

	throwCancelMatchmakingResearchEvent () {
		const event = new CustomEvent('cancelMatchmakingResearchEvent', {
			bubbles: true
		});

		document.dispatchEvent(event);
	}

	replacePlayBtnByCancel() {
		this.cancelButton.style.display = 'flex';
		this.playButton.style.display = 'none';
	}

	replaceCancelBtnByPlay() {
		this.cancelButton.style.display = 'none';
		this.playButton.style.display = 'flex';
	}

}

customElements.define('unranked-component', UnrankedComponent);