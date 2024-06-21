
async function extendGameComponent(gameComponent) {
	document.querySelector('.game-fullscreen-background').style.display = 'block';
	gameComponent.classList.add('extended-game');
	gameComponent.querySelector('.extend-game-button').style.display = 'none';
	gameComponent.querySelector('.reduce-game-button').style.display = 'block';
	// await sleep(200);
	throwGameExtendedEvent();
}

function throwGameExtendedEvent(e) {
	const event = new CustomEvent('game-extended', {
		bubbles: true
	});

	document.dispatchEvent(event);
}

function sleep(sleepDuration) {
	return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

export default extendGameComponent;