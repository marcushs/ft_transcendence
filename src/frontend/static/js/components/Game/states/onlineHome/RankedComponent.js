import { sendMatchSearchRequest } from "../../../../utils/matchmaking/matchResearch.js";
import {getString} from "../../../../utils/languageManagement.js";
import "../../../Matchmaking/MatchmakingResearchComponent.js"
import resetButtonsOnMatchmakingCanceled from "../../../../utils/resetButtonsOnMatchmakingCanceled.js";
import disableButtonsInGameResearch from "../../../../utils/disableButtonsInGameResearch.js";

class RankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="ranked-component-content">
				<h4>${getString('gameComponent/ranked')}</h4>
				${this.createRankContainer('master')}
				<button-component label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
				<button-component label="${getString('buttonComponent/cancel')}" class="generic-btn-cancel" style="display: none"></button-component>
			</div>
		`;
	}


	connectedCallback() {
		this.playButton = this.querySelector('.generic-btn');
		this.cancelButton = this.querySelector('.generic-btn-cancel');

		const isSearchingGame = JSON.parse(localStorage.getItem('isSearchingGame'));

		if (isSearchingGame && isSearchingGame.type !== "ranked")
			this.playButton.className = "generic-btn-disabled";
		else if (isSearchingGame)
			this.replacePlayBtnByCancel();

		this.attachEventsListener();
	}


	createRankContainer(rank) {
		return `
			<div class="rank-container rank-container-${rank}">
				<div class="rank-container-content">					
					<div class="rank-logo rank-${rank}-logo"></div>
					<p class="rank-name rank-name-${rank}">${getString(`ranks/${rank}`)}</p>
					<div class="rank-elo-container">
						<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
						<p class="elo">10255</p>
					</div>
					<div class="next-rank-infos">
						${this.createRankInfos(rank)}
					</div>
				</div>
			</div>
		`;
	}

	createRankInfos(rank) {
		if (rank === 'master') {
			return `<p class="max-rank">${getString('ranks/maxRank')}</p>`;
		}
		return `
			<p>${getString('ranks/nextRank')}</p>
			<div class="next-rank-percentage-bar">	
				<div class="inner-bar inner-bar-${rank}"></div>
			</div>
			<div class="next-rank-elo">
				<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
				<p>10000</p>
			</div>
		`;
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
		if (await sendMatchSearchRequest('ranked'))
			disableButtonsInGameResearch();
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
}

customElements.define('ranked-component', RankedComponent);