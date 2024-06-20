
async function extendGameComponent(gameComponent) {
    let topPosition = gameComponent.offsetTop; // Position of game before animation
    let startHeight = parseFloat(getComputedStyle(gameComponent).height);  // Size before animation
    let startWidth = parseFloat(getComputedStyle(gameComponent).width); // Size before animation
    const heightTarget = window.innerHeight * 0.95; // Size of game after animation
    const intervalLoop = Math.round((heightTarget - startHeight) / 5); // Number of loop to determine how many decrement the top position
    const decrementTop = (topPosition - ((window.innerHeight * 0.05) / 2)) / intervalLoop; // Number to decrement top in loop

    gameComponent.style['position'] = 'absolute';
    document.querySelector('.game-fullscreen-background').style.display = 'block';

    while (startHeight < heightTarget) {
        startWidth += 5 * 100 / 63; // To determine the increase size of width (to keep the good ratio height / width)
        startHeight += 5;
        topPosition -= decrementTop;
        gameComponent.style['width'] = `${startWidth}px`;
        gameComponent.style['height'] = `${startHeight}px`;
        gameComponent.style['top'] = `${topPosition}px`;
        await sleep(1);
    }

    gameComponent.querySelector('game-top-bar').style.paddingTop = '2.5rem';
    gameComponent.querySelector('.extend-game-button').style.display = 'none';
    gameComponent.querySelector('.reduce-game-button').style.display = 'block';
    throwGameExtendedEvent();
}

function throwGameExtendedEvent() {
    const event = new CustomEvent('game-extended', {
        bubbles: true
    });

    document.dispatchEvent(event);
}

function sleep(sleepDuration) {
    return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

export default extendGameComponent;