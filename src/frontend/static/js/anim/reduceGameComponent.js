import sleep from "../utils/sleep.js";

async function reduceGameComponent(gameComponent) {
	gameComponent.classList.remove('extended-game');
	gameComponent.classList.add('reduced-game');
	gameComponent.querySelector('.extend-game-button').style.display = 'block';
	gameComponent.querySelector('.reduce-game-button').style.display = 'none';
	gameComponent.querySelector('game-top-bar .top-bar-options').style.paddingTop = '0';
	gameComponent.querySelector('.game-settings').style.width = '9rem';
	gameComponent.querySelector('emotes-component > img').style.height = '3.2rem';
	gameComponent.querySelector('emotes-component').style.paddingBottom = '3.8rem';
	gameComponent.querySelector('.emotes-container').style.bottom = '2rem';
	gameComponent.querySelector('.emotes-container').style.right = '7.4rem';
	gameComponent.querySelectorAll('.emotes-container img').forEach(img => {
		img.style.height = '4rem';
	});
	gameComponent.addEventListener('animationend', async (event) => manageBackgroundDisplay(event, gameComponent));
}

async function manageBackgroundDisplay(event, gameComponent) {
	gameComponent.classList.remove('reduced-game');
	if (event.animationName === 'move-game-to-left') {
		for (let i = 9; i > 0; i -= 0.5) {
			document.querySelector('.game-fullscreen-background').style.opacity = `0.${i}`;
			await sleep(1);
		}
		document.querySelector('.game-fullscreen-background').style.display = 'none';
		document.querySelector('.game-fullscreen-background').style.opacity = '1';
		gameComponent.style.zIndex = '2';
	}
}

export default reduceGameComponent;