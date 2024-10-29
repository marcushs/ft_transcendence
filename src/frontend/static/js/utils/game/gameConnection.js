import { websocketReconnection } from "../../components/Game/states/inGame/gameWebsocket.js";
import { sendRequest } from "../sendRequest.js";

export async function handleGameReconnection(userId, gameState) {
    if (window.location.pathname !== '/') {
        throwRedirectionEvent('/');
        await waitForStatesContainer();
    }
    const isReconnected = await websocketReconnection(userId);
    if (!isReconnected)
        return;
    const statesContainerDiv = document.querySelector('.states-container');
    
    statesContainerDiv.innerHTML = '';
    for (let i = 0; i < statesContainerDiv.classList.length; i++) {
        if (statesContainerDiv.classList[i] === 'states-container')
            continue;
        statesContainerDiv.classList.remove(statesContainerDiv.classList[i])
    }
    const inGameComponent = document.createElement('in-game-component');
    inGameComponent.setState(gameState)
    statesContainerDiv.appendChild(inGameComponent);
}

export async function waitForStatesContainer() {
    await new Promise(resolve => {
        const observer = new MutationObserver(() => {
            const newContainer = document.querySelector('.states-container');
            if (newContainer) {
                observer.disconnect();
                resolve();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

export async function surrenderHandler() {
    const savedState = localStorage.getItem('inGameComponentState');
    const gameState = savedState ? JSON.parse(savedState) : null;
    if (!gameState)
        return;
    try {
        const payload = {
            game_id: gameState.gameId,
            player_id: gameState.userId
        };
        const response = await sendRequest('POST', '/api/game/surrend_game/', payload);
		localStorage.removeItem('inGameComponentState');
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}