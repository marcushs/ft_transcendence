import '../../../ButtonComponent.js';
import './JoinComponent.js';
import './CreateComponent.js'
import {getString} from "../../../../utils/languageManagement.js";

class tournamentHome {

	constructor() {
		this.redirectState = "tournament-home";
		this.class = "tournament-home";
	}

	render() {
		return `
			<div class="tournament-home-container">
				<h3 state-redirect bracket>${getString('gameComponent/tournaments')}</h3>
				<div class="tournament-components-container">
					<create-component></create-component>
					<join-component></join-component>
				</div>
			</div>
		`;
	}
}

export default tournamentHome;