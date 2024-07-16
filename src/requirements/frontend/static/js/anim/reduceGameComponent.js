import sleep from "../utils/sleep.js";

async function reduceGameComponent(gameComponent) {
	gameComponent.classList.remove('extended-game');
	gameComponent.classList.add('reduced-game');
	gameComponent.querySelector('.extend-game-button').style.display = 'inline';
	gameComponent.querySelector('.reduce-game-button').style.display = 'none';
	gameComponent.querySelector('game-top-bar').style.paddingTop = '1.8rem';
	gameComponent.addEventListener('animationend', async (event) => manageBackgroundDisplay(event));
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
	}
}

export default reduceGameComponent;