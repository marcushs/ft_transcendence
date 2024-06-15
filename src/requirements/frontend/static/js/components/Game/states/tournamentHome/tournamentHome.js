import '../../../ButtonComponent.js';
import './JoinComponent.js';

class tournamentHome {

	constructor() {
		this.redirectState = "tournament-home";
		this.class = "tournament-home";
	}

	render() {
		return `
			<div class="tournament-home-container">
				<h3>Tournament</h3>
				<div class="tournament-boxes-container">
					<div class="create-tournament"></div>
					<join-component></join-component>
				</div>
			</div>
		`
	}
}

export default tournamentHome;