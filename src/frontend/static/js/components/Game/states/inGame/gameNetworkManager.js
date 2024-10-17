import { disconnectWebSocket, websocketReconnection } from "./gameWebsocket.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import { resetGameInstance } from "./inGameComponent.js";

export class GameInactivityHandler {
    constructor(userId) {
        if (GameInactivityHandler.instance) {
            return GameInactivityHandler.instance;
        }
        
        const savedState = localStorage.getItem('inGameComponentState');
        this.gameState = savedState ? JSON.parse(savedState) : null;
        this.userId = userId;
        this.isRunningHandler = false;
        this.inactivityTimeout = null;
        GameInactivityHandler.instance = this;
    }

    async handleDisconnect() {
        if (!this.gameState || this.isRunningHandler)
            return;
        this.isRunningHandler = true;
        disconnectWebSocket(this.userId, true);
        this.checkInactivity();
    }

    async checkInactivity() {
        const wantReconnect = confirm("You've left the game. Do you want to return to the game or surrender?");

        if (wantReconnect) {
            await this.handleReconnection();
        } else {
            await this.handleSurrender();
        }
    }

    async handleReconnection() {
        const container = document.querySelector('.states-container');
        if (!container)
            return;
        const isReconnected = await websocketReconnection(this.userId);
        if (!isReconnected)
            return;
        let statesContainerDiv = document.querySelector('.states-container');
        if (!statesContainerDiv) {
            throwRedirectionEvent('/');
            statesContainerDiv = document.querySelector('.states-container');
        }
        statesContainerDiv.innerHTML = '';
        for (let i = 0; i < statesContainerDiv.classList.length; i++) {
            console.log(`classlist: ${statesContainerDiv.classList[i]} -- type: ${typeof(statesContainerDiv.classList[i])}`);
            if (statesContainerDiv.classList[i] === 'states-container')
                continue;
            statesContainerDiv.classList.remove(statesContainerDiv.classList[i])
        }
        const inGameComponent = document.createElement('in-game-component');
        inGameComponent.setState(this.gameState)
        statesContainerDiv.appendChild(inGameComponent);
        this.isRunningHandler = false;
    }

    async handleSurrender() {
        surrenderHandler();
        this.isRunningHandler = false;
    }
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
        const response = await sendRequest('POST', 'http://localhost:8005/game/surrend_game/', payload);
        localStorage.removeItem('inGameComponentState');
        resetGameInstance();
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}