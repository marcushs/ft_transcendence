import { gameSocket } from "../components/Game/states/inGame/gameWebsocket.js";
import { disconnectGameWebSocket } from "../components/Game/states/inGame/gameWebsocket.js";


export function unloadManager() {    
    const savedState = localStorage.getItem('inGameComponentState');
    const gameState = savedState ? JSON.parse(savedState) : null;
    if (gameState && gameSocket && gameSocket.readyState === WebSocket.OPEN) {
        disconnectGameWebSocket(gameState.userId, true)
    }
}