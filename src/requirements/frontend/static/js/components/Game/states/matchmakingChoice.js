import {getString} from "../../../utils/languageManagement.js";

class matchmakingChoice {

	constructor() {
		this.redirectState = "matchmaking-choice";
		this.class = "matchmaking-choice";
		this.context = "/";
	}

	render() {
		return `
			<p state-redirect tournament-home>${getString('gameComponent/tournaments')}</p>
			<p state-redirect online-home>${getString('gameComponent/online')}</p>
			<p state-redirect local-home>${getString('gameComponent/local')}</p>
		`;
	}
}


export default matchmakingChoice;