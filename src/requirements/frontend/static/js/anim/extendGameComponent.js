
async function extendGameComponent(gameComponent) {
	document.querySelector('.game-fullscreen-background').style.display = 'block';
	gameComponent.classList.remove('reduced-game');
	gameComponent.classList.add('extended-game');
	gameComponent.querySelector('game-top-bar').style.paddingTop = '3rem';
	gameComponent.querySelector('.extend-game-button').style.display = 'none';
<<<<<<< Updated upstream
	gameComponent.querySelector('.reduce-game-button').style.display = 'block';
	// await sleep(200);
	throwGameExtendedEvent();
}

function throwGameExtendedEvent(e) {
	const event = new CustomEvent('game-extended', {
		bubbles: true
	});

	document.dispatchEvent(event);
=======
	gameComponent.querySelector('.reduce-game-button').style.display = 'inline';
>>>>>>> Stashed changes
}

function sleep(sleepDuration) {
	return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

export default extendGameComponent;