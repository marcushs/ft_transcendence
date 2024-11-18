class QuitTournamentComponent extends HTMLElement {
    static instance = null;

    constructor() {
        super();

        if (QuitTournamentComponent.instance) {
            return;
        }
        QuitTournamentComponent.instance = this

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
            await handleGameReconnection(this.gameState.userId, this.gameState)
            this.removeInstance();
        })
        this.LeaveChoice.addEventListener('click', async () => {            
            await surrenderHandler();
            this.removeInstance();
        })
    }

    removeInstance() {
        QuitTournamentComponent.instance = null;
        this.remove();
    }
}

customElements.define('quit-tournament-component', QuitTournamentComponent);
