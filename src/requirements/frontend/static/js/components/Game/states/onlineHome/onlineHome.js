import './UnrankedComponent.js'
import './PrivateMatchComponent.js'

class onlineHome {

	constructor() {
		this.redirectState = "online-home";
		this.class = "online-home";
	}

	render() {
		return `
			<div class="online-home-container">
				<h3>Online</h3>
				<div class="online-components-container">
<!--					<div class="left-section">				-->
<!--					<ranked-component></ranked-component>-->
<!--					</div>-->
					<div class="right-section">
						<unranked-component></unranked-component>
						<private-match-component></private-match-component>
					</div>
				</div>
			</div>
		`;
	}
}

export default onlineHome;