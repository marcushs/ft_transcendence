import "../components/NavBarComponent.js"
import "../components/Game/GameComponent.js"
import "../components/MatchHistory.js"
import "../components/ContactsMenuComponent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import {sendRequest} from "../utils/sendRequest.js";

export default () => {
	const homePage = `
		<section class="home-page">		
			<nav-bar-component></nav-bar-component>
            <div class="game-fullscreen-background"></div>
			<section class="home-main-section">
				<game-component></game-component>
				<match-history-component></match-history-component>
				<button label="test" style="z-index: 1000000">test</button>
			</section>
			<contact-menu-component></contact-menu-component>
		</section>
	`;

	setTimeout(() =>{
		test();
	}, 0);

	return homePage;
}

function test() {
	document.querySelector('button[label="test"]').addEventListener("click", async () => {
		try {
			await sendRequest('POST', 'http://localhost:8006/matchmaking/matchmaking/', {
				type: 'ranked',
			});
		} catch (error) {
			console.error(error);
		}
	})
}
