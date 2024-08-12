async function extendGameComponent(gameComponent) {
	document.querySelector('.game-fullscreen-background').style.display = 'block';
	gameComponent.classList.remove('reduced-game');
	gameComponent.classList.add('extended-game');
	gameComponent.querySelector('game-top-bar').style.paddingTop = '3rem';
	gameComponent.querySelector('.extend-game-button').style.display = 'none';
	gameComponent.querySelector('.reduce-game-button').style.display = 'inline';
}

export default extendGameComponent;