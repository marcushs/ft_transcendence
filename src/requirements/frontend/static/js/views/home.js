import "../components/NavBar.js"
import "../components/Game/Game.js"
import "../components/MatchHistory.js"
import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";
import rotatingGradient from "../anim/rotatingGradient.js";

export default () => {
	const homePage = `
		<section class="home-page">		
			<nav-bar-component></nav-bar-component>
            <div class="game-fullscreen-background"></div>
            <button></button>
			<section class="home-main-section">
				<game-component></game-component>
				<match-history-component></match-history-component>
			</section>
		</section>
	`;

	setTimeout(() =>{
		typeAndReplaceWords();
		rotatingGradient('game-component');
		rotatingGradient('.game-background');
	}, 0);

	return homePage;
}
