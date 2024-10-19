import { disconnectWebSocket, websocketReconnection } from "./gameWebsocket.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import { gameInstance, resetGameInstance } from "./inGameComponent.js";

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

    async startReconnectChoice() {
        if (!this.gameState || this.isRunningHandler)
            return;
        this.isRunningHandler = true;
        disconnectWebSocket(this.userId, true);
        this.render();
        this.attachEventsListener();
    }

    render() {
        this.innerHTML = `
            <div class="inactive-game-pop-up">
                <p>you have a game in progress</p>
                <p>reconnect or leave?</p>
                <div class="inactive-game-choice-icon">
                    <p class="inactive-game-choice-reconnect">Reconnect</p>
                    <p class="inactive-game-choice-leave">Leave</p>
                </div>
            </div>
        `
        app.innerHTML += this.innerHTML;
        this.inactivePopUp = document.querySelector('.inactive-game-pop-up')
        this.reconnectChoice = document.querySelector('.inactive-game-choice-reconnect');
        this.LeaveChoice = document.querySelector('.inactive-game-choice-leave');
    }

    attachEventsListener() {
        this.reconnectChoice.addEventListener('click', () => {
            console.log('event reached !');
            
            this.handleReconnection();
        })
        this.LeaveChoice.addEventListener('click', () => {
            console.log('event reached !');
            
            surrenderHandler();
            this.inactivePopUp.remove();
            this.isRunningHandler = false;
        })
    }

    async handleReconnection() {
        const container = document.querySelector('.states-container');
        if (!container)
            return;
        const isReconnected = await websocketReconnection(this.userId);
        if (!isReconnected)
            return;
        this.inactivePopUp.remove();
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
        this.isRunningHandler = false;
        const inGameComponent = document.createElement('in-game-component');
        inGameComponent.setState(this.gameState)
        statesContainerDiv.appendChild(inGameComponent);
    }

    async handleSurrender() {
        disconnectWebSocket();
        surrenderHandler();
        this.isRunningHandler = false;
    }
}

export async function surrenderHandler() {
    const savedState = localStorage.getItem('inGameComponentState');
    const gameState = savedState ? JSON.parse(savedState) : null;
    if (!gameState || !gameInstance)
        return;
    try {
        const payload = {
            game_id: gameState.gameId,
            player_id: gameState.userId
        };
        const response = await sendRequest('POST', 'http://localhost:8005/game/surrend_game/', payload);
        gameInstance.cleanup();
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}