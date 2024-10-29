import { matchmakingSocket, matchmakingWebsocket } from "../../matchmakingWebsocket.js";
import { requestMatchmakingResearch } from "../../MatchmakingResearchComponent.js";
import {getString} from "../../../../utils/languageManagement.js";
import "../../MatchmakingResearchComponent.js"

class RankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="ranked-component-content">
				<h4>${getString('gameComponent/ranked')}</h4>
				${this.createRankContainer('master')}
				<button-component label="${getString('buttonComponent/play')}" class="generic-btn"></button>
			</div>
		`;
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
		this.querySelector('button-component').addEventListener('click', () => {
			this.handlePlayButtonClick();
		})
	}

	async handlePlayButtonClick() {
		try {
			await matchmakingWebsocket();
			if (!requestMatchmakingResearch({type: 'ranked'})) {
				if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
					matchmakingSocket.close();
				return;
			}
			localStorage.setItem('isSearchingGame', JSON.stringify({
				type: 'ranked',
				status: 'searching'
			}));
			const researchComponent = document.createElement('matchmaking-research-component');
			app.appendChild(researchComponent);
		} catch (error) {
			console.error(error);
		}
	}
}

customElements.define('ranked-component', RankedComponent);