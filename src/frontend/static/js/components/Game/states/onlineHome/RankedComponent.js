class RankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="ranked-component-content">
				<h4>Ranked</h4>
				${this.createRankContainer('master')}
				<button-component label="Play" class="generic-btn"></button>
			</div>
		`;
	}

	createRankContainer(rank) {
		return `
			<div class="rank-container rank-container-${rank}">
				<div class="rank-container-content">					
					<div class="rank-logo rank-${rank}-logo"></div>
					<p class="rank-name rank-name-${rank}">${rank.at(0).toUpperCase() + rank.slice(1, rank.length)}</p>
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
			return `<p class="max-rank">Max rank</p>`;
		}
		return `
			<p>Next rank</p>
			<div class="next-rank-percentage-bar">	
				<div class="inner-bar inner-bar-${rank}"></div>
			</div>
			<div class="next-rank-elo">
				<img src="../../../../../assets/rp-logo.svg" alt="rp logo">
				<p>10000</p>
			</div>
		`;
	}

}

customElements.define('ranked-component', RankedComponent);