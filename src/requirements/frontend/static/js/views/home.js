import "../components/NavBar.js"
import "../components/Game/Game.js"
import "../components/MatchHistory.js"
import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const homePage = `
		<section class="home-page">		
			<nav-bar-component></nav-bar-component>
			<section class="home-main-section">
				<game-component></game-component>
				<match-history-component></match-history-component>
			</section>
		</section>
	`;

	setTimeout(() =>{
		typeAndReplaceWords();
		rotatingGradient('game-component');
		rotatingGradient('.game-gradient');
	}, 0);

	return homePage;
}
