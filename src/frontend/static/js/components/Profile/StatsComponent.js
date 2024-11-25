import {throwRedirectionEvent} from "../../utils/throwRedirectionEvent.js";
import {getString} from "../../utils/languageManagement.js";
import {sendRequest} from "../../utils/sendRequest.js";
import getUserId from "../../utils/getUserId.js";

class StatsComponent extends HTMLElement {
	constructor() {
		super();

		this.rankPoints = {
			bronze: [0, 999],
			silver: [1000, 2999],
			gold: [3000, 5999],
			diamond: [6000, 9999],
			master: 10000
		}

		this.initializeComponent();
	}

	initializeComponent() {
		this.innerHTML = `

		`;
	}

	async connectedCallback() {
		let statistics = await sendRequest('GET', `/api/statistics/get_user_statistics/?q=${await getUserId()}`, null);

		statistics = statistics.user_statistics;

		this.innerHTML = `
			<div class="rank-infos">
				${this.createRankContainer(statistics.rank, statistics.rank_points)}
			</div>
			<div class="game-infos">
				<div class="info">
					<p>${getString("statistics/gamesPlayed")}</p>
					<div class="number-container">
						<p>${statistics.total_game_played}</p>
					</div>
				</div>
				<div class="info">
					<p>${getString("statistics/gamesWin")}</p>
					<div class="number-container">
						<p>${statistics.total_win}</p>
					</div>
				</div>
				<div class="info">
					<p>${getString("statistics/gamesLose")}</p>
					<div class="number-container">
						<p>${statistics.total_loose}</p>
					</div>
				</div>
				<div class="info">
					<p>${getString("statistics/winLoseRatio")}</p>
					<div class="number-container">
						<p>${statistics.win_loose_ratio}</p>
					</div>
				</div>
			</div>
		`;
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

}

customElements.define('stats-component', StatsComponent);