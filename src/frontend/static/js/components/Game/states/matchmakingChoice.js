import './inGameComponent.js';

class matchmakingChoice {

	constructor() {
		this.redirectState = "matchmaking-choice";
		this.class = "matchmaking-choice";
		this.context = "/";
	}

	render() {
		return `
			<in-game-component></in-game-component>
		`;
			// <p state-redirect tournament-home>${getString('gameComponent/tournaments')}</p>
			// <p state-redirect online-home>${getString('gameComponent/online')}</p>
			// <p state-redirect local-home>${getString('gameComponent/local')}</p>
	}
}


export default matchmakingChoice;