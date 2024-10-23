import { sendRequest } from "../../../../utils/sendRequest.js";
import { websocketReconnection } from "./gameWebsocket.js";
import { throwRedirectionEvent } from "../../../../utils/throwRedirectionEvent.js";
import { throwGameInactivityEvent } from "../../../../utils/throwGameInactivityEvent.js"

export async function checkInactiveGame() {
    const savedState = localStorage.getItem('inGameComponentState');
    const gameState = savedState ? JSON.parse(savedState) : null;
    if (gameState) {
        try {
            const gameStatus = await GameStillActive(gameState.gameId);
            if (gameStatus.status === 'success' && gameStatus.user_in === true)
                throwGameInactivityEvent();
            else
                localStorage.removeItem('inGameComponentState');
        } catch (error) {
            console.log(error.message);
            return;
        }
    }
}

export async function GameStillActive(game_id) {
	try {
		const dataResponse = await sendRequest('GET', `http://localhost:8005/game/game_is_active/?q=${game_id}`, null)
		return dataResponse;
	} catch (error) {
		throw new Error(error.message)
	}
}

class GameInactivityComponent extends HTMLElement {
    constructor() {
        super();
        const savedState = localStorage.getItem('inGameComponentState');
        this.gameState = savedState ? JSON.parse(savedState) : null;
        this.isGameRendered = document.querySelector('in-game-component');
    }

    connectedCallback() {
        this.listenChoices();
    }

    async listenChoices() {
        if (!this.gameState || this.isGameRendered)
            return;
        console.log('inactivity handler reached ! this.gameState: ', this.gameState, ' -- this.isGameRendered: ', this.isGameRendered);
        this.render();
        this.attachEventsListener();
    }

    render() {
        this.innerHTML = `
        <div class="inactive-game-pop-up-background">
            <div class="background-overlay"></div>
            <div class="inactive-game-pop-up">
                <p>you have a game in progress</p>
                <p>reconnect or leave?</p>
                <div class="inactive-game-choice-icon">
                    <p class="inactive-game-choice-reconnect">Reconnect</p>
                    <p class="inactive-game-choice-leave">Leave</p>
                </div>
            </div>
        </div>
        `
        this.inactivePopUp = document.querySelector('.inactive-game-pop-up')
        this.reconnectChoice = document.querySelector('.inactive-game-choice-reconnect');
        this.LeaveChoice = document.querySelector('.inactive-game-choice-leave');
    }

    attachEventsListener() {
        this.reconnectChoice.addEventListener('click', async () => {            
            await this.handleReconnection();
            this.remove();
        })
        this.LeaveChoice.addEventListener('click', async () => {            
            await this.handleSurrender();
            this.remove();
        })
    }

    async handleReconnection() {
        if (window.location.pathname !== '/') {
            throwRedirectionEvent('/');
            await this.waitForStatesContainer();
        }
        const isReconnected = await websocketReconnection(this.gameState.userId);
        if (!isReconnected)
            return;
        const statesContainerDiv = document.querySelector('.states-container');
        console.log('statesContainerDiv: ', statesContainerDiv);
        
        statesContainerDiv.innerHTML = '';
        for (let i = 0; i < statesContainerDiv.classList.length; i++) {
            if (statesContainerDiv.classList[i] === 'states-container')
                continue;
            statesContainerDiv.classList.remove(statesContainerDiv.classList[i])
        }
        const inGameComponent = document.createElement('in-game-component');
        inGameComponent.setState(this.gameState)
        statesContainerDiv.appendChild(inGameComponent);
    }

    async waitForStatesContainer() {
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

    async handleSurrender() {
        await surrenderHandler();
    }
}
customElements.define('game-inactivity-component', GameInactivityComponent);

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
        console.log(response);
    } catch (error) {
        console.log(error);
    }
}