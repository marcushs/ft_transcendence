import { sendRequest } from "../../../../utils/sendRequest.js";
import { throwGameInactivityEvent } from "../../../../utils/throwGameInactivityEvent.js"
import { surrenderHandler, handleGameReconnection } from "../../../../utils/game/gameConnection.js";

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
		const dataResponse = await sendRequest('GET', `/api/game/game_is_active/?q=${game_id}`, null)
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
            console.log('this.gameState: ', this.gameState);
            await handleGameReconnection(this.gameState.userId, this.gameState)
            this.remove();
        })
        this.LeaveChoice.addEventListener('click', async () => {            
            await surrenderHandler();
            this.remove();
        })
    }
}

customElements.define('game-inactivity-component', GameInactivityComponent);