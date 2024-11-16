import './inGame/inGameComponent.js';
import {getString} from "../../../utils/languageManagement.js";
import checkAuthentication from "../../../utils/checkAuthentication.js";

class matchmakingChoice {

	constructor() {
		this.redirectState = "matchmaking-choice";
		this.class = "matchmaking-choice";
		this.context = "/";

		document.addEventListener('matchmakingResearchCanceledEvent', () => this.handleMatchmakingResearchCanceledEvent());
	}

	async render() {
		this.isConnected = await checkAuthentication();

		const isSearchingGame = JSON.parse(localStorage.getItem('isSearchingGame'));
		const tournamentPClass = this.getPElementClass(isSearchingGame, "tournament");
		const onlinePClass = this.getPElementClass(isSearchingGame, "online");
		const localPClass = this.getPElementClass(isSearchingGame, "local");

		return `
			<p state-redirect tournament-home class="${tournamentPClass}">${getString('gameComponent/tournaments')}</p>
			<p state-redirect online-home class="${onlinePClass}">${getString('gameComponent/online')}</p>
			<p state-redirect local-home class="${localPClass}">${getString('gameComponent/local')}</p>
		`;
	}

	getPElementClass(isSearchingGame, matchmakingType) {
		if ((localStorage.getItem("isSearchingPrivateMatch") || localStorage.getItem("isReadyToPlay") || localStorage.getItem("isInGuestState")) && matchmakingType !== "online")
			return 'unavailable-matchmaking-choice';
		if (this.isConnected === false && matchmakingType !== "local")
			return 'unavailable-matchmaking-choice';
		if (isSearchingGame === null)
			return '';
		if (isSearchingGame.type !== "tournament" && matchmakingType !== "tournament" && matchmakingType !== "local")
			return '';
		return 'unavailable-matchmaking-choice';
	}

	handleMatchmakingResearchCanceledEvent() {
		document.querySelectorAll('p').forEach((p) => {
			if (p.className === "unavailable-matchmaking-choice")
				p.className = "";
		});
	}

}


export default matchmakingChoice;