import { sendMatchSearchRequest } from "../../../../utils/matchmaking/matchResearch.js";
import {getString} from "../../../../utils/languageManagement.js";
import "../../../Matchmaking/MatchmakingResearchComponent.js"
import resetButtonsOnMatchmakingCanceled from "../../../../utils/resetButtonsOnMatchmakingCanceled.js";
import disableButtonsInGameResearch from "../../../../utils/disableButtonsInGameResearch.js";
import {sendRequest} from "../../../../utils/sendRequest.js";
import getUserId from "../../../../utils/getUserId.js";

class RankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="ranked-component-content">
			</div>
		`;

		this.rankPoints = {
			bronze: [0, 999],
			silver: [1000, 2999],
			gold: [3000, 5999],
			diamond: [6000, 9999]
		}
	}

	async connectedCallback() {

		await this.fillRankComponentContent();

		this.playButton = this.querySelector('.generic-btn');
		this.cancelButton = this.querySelector('.generic-btn-cancel');

		const isSearchingGame = JSON.parse(localStorage.getItem('isSearchingGame'));

		if ((isSearchingGame && isSearchingGame.type !== "ranked") || localStorage.getItem("isSearchingPrivateMatch") || localStorage.getItem('isInGuestState') ) {
			this.playButton.className = "generic-btn-disabled";
		}
		else if (isSearchingGame)
			this.replacePlayBtnByCancel();

		this.attachEventsListener();
	}


	async fillRankComponentContent(){
		const rankedComponentContentElement = this.querySelector('.ranked-component-content');
		const rankedData = await sendRequest("GET", `/api/statistics/get_user_statistics/?q=${await getUserId()}`, null);

		rankedComponentContentElement.innerHTML += `
			<h4>${getString('gameComponent/ranked')}</h4>
			${this.createRankContainer(rankedData.user_statistics.rank, rankedData.user_statistics.rank_points)}
			<button-component id="rankedGenericBtn" label="${getString('buttonComponent/play')}" class="generic-btn"></button-component>
			<button-component label="${getString('buttonComponent/cancel')}" class="generic-btn-cancel" style="display: none"></button-component>
		`
	}


	createRankContainer(rank, rankPoints) {
		return `
			<div class="rank-container rank-container-${rank}">
				<div class="rank-container-content">					
					<div class="rank-logo rank-${rank}-logo"></div>
					<p class="rank-name rank-name-${rank}">${getString(`ranks/${rank}`)}</p>
					<div class="rank-elo-container">
						<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
						<p class="elo">${rankPoints}</p>
					</div>
					<div class="next-rank-infos">
						${this.createRankInfos(rank, rankPoints)}
					</div>
				</div>
			</div>
		`;
	}

	createRankInfos(rank, rankPoints) {
		if (rank === 'master')
			return `<p class="max-rank">${getString('ranks/maxRank')}</p>`;

		const innerBarPercentage = (rankPoints - this.rankPoints[rank][0]) * 100 / (this.rankPoints[rank][1] - this.rankPoints[rank][0]);
		return `
			<p>${getString('ranks/nextRank')}</p>
			<div class="next-rank-percentage-bar">	
				<div class="inner-bar inner-bar-${rank}" style="width: ${innerBarPercentage}%"></div>
			</div>
			<div class="next-rank-elo">
				<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
				<p>${this.rankPoints[rank][1] + 1}</p>
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
}

customElements.define('ranked-component', RankedComponent);