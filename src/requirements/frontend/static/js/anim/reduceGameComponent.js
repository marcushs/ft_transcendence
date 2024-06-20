
async function reduceGameComponent(gameComponent) {
	gameComponent.classList.remove('extended-game');
	gameComponent.querySelector('.extend-game-button').style.display = 'block';
	gameComponent.querySelector('.reduce-game-button').style.display = 'none';
	gameComponent.querySelector('game-top-bar').style.paddingTop = '2rem';
	document.querySelector('.game-fullscreen-background').style.display = 'none';
	throwGameReducedEvent();
}

function throwGameReducedEvent() {
	const event = new CustomEvent('game-reduced', {
		bubbles: true
	});

	document.dispatchEvent(event);
}

export default reduceGameComponent;