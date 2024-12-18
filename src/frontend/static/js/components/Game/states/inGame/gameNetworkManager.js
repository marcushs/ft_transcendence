import { sendRequest } from "../../../../utils/sendRequest.js";
import { throwGameInactivityEvent } from "../../../../utils/throwGameInactivityEvent.js"
import { surrenderHandler, handleGameReconnection } from "../../../../utils/game/gameConnection.js";
import checkAuthentication from "../../../../utils/checkAuthentication.js";
import { getString } from "../../../../utils/languageManagement.js";

export async function checkInactiveGame() {
    const isConnected = await checkAuthentication();
    if (!isConnected)
        return;
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
            console.error(error.message);
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
    static instance = null;

    constructor() {
        super();

        if (GameInactivityComponent.instance) {
            return;
        }
        GameInactivityComponent.instance = this

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
                <p>${getString('inactiveGamePopUp/gameInProgress')}</p>
                <p>${getString('inactiveGamePopUp/reconnectOrLeave')}</p>
                <div class="inactive-game-choice-icon">
                    <p class="inactive-game-choice-reconnect">${getString('inactiveGamePopUp/reconnectChoice')}</p>
                    <p class="inactive-game-choice-leave">${getString('inactiveGamePopUp/leaveChoice')}</p>
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
            await handleGameReconnection(this.gameState.userId, this.gameState);
            this.removeInstance();
        })
        this.LeaveChoice.addEventListener('click', async () => {
            await surrenderHandler();
            this.removeInstance();
        })
    }

    removeInstance() {
        GameInactivityComponent.instance = null;
        this.remove();
    }
}

customElements.define('game-inactivity-component', GameInactivityComponent);
