import "../components/NavBarComponent.js"
import "../components/Game/GameComponent.js"
import "../components/MatchHistory.js"
import "../components/ContactsMenuComponent.js"
import "../components/Chat/ChatComponent.js"

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
			<chat-component></chat-component>
		</section>
	`;

	return homePage;
}
