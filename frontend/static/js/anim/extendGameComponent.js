async function extendGameComponent(gameComponent) {
	document.querySelector('.game-fullscreen-background').style.display = 'block';
	document.querySelector('.game-fullscreen-background').style.zIndex = '3';
	gameComponent.classList.remove('reduced-game');
	gameComponent.style.zIndex = '5';
	gameComponent.classList.add('extended-game');
	gameComponent.querySelector('game-top-bar .top-bar-options').style.paddingTop = '2rem';
	gameComponent.querySelector('.extend-game-button').style.display = 'none';
	gameComponent.querySelector('.reduce-game-button').style.display = 'block';
	gameComponent.querySelector('.game-settings').style.width = '11.5rem';
	gameComponent.querySelector('emotes-component > img').style.height = '4rem';
	gameComponent.querySelector('emotes-component').style.paddingBottom = '5rem';
	gameComponent.querySelector('.emotes-container').style.bottom = '3.5rem';
	gameComponent.querySelector('.emotes-container').style.right = '8.9rem';
	gameComponent.querySelectorAll('.emotes-container img').forEach(img => {
		img.style.height = '5rem';
	});
}

export default extendGameComponent;