
async function reduceGameComponent(gameComponent) {
	gameComponent.style['position'] = 'relative';
	gameComponent.style['top'] = '';
	gameComponent.style['width'] = '140rem';
	gameComponent.style['height'] = 'calc((140rem * 63) / 100)';
	gameComponent.querySelector('.extend-game-button').style.display = 'block';
	gameComponent.querySelector('.reduce-game-button').style.display = 'none';
	document.querySelector('.game-fullscreen-background').style.display = 'none';
}

export default reduceGameComponent;