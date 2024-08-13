import "../components/NavBarComponent.js"
import "../components/Game/Game.js"
import "../components/MatchHistory.js"
import "../components/ContactsComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const homePage = `
		<section class="home-page">		
			<nav-bar-component></nav-bar-component>
            <div class="game-fullscreen-background"></div>
			<section class="home-main-section">
				<game-component></game-component>
				<match-history-component></match-history-component>
			</section>
			<contact-menu-component></contact-menu-component>
		</section>
	`;

	// setTimeout(() =>{
	//
	// }, 0);

	return homePage;
}
