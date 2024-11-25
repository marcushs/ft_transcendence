class QuitTournamentComponent extends HTMLElement {
    static instance = null;

    constructor() {
        super();

        if (QuitTournamentComponent.instance) {
            return;
        }
        QuitTournamentComponent.instance = this

        const savedState = localStorage.getItem('tournamentData');
        this.tournamentState = savedState ? JSON.parse(savedState) : null;
        this.isGameRendered = document.querySelector('in-game-component');
        console.log(this.tournamentState);
    }

    connectedCallback() {
        this.listenChoices();
    }

    async listenChoices() {
        if (!this.tournamentState || this.isGameRendered)
            return;
        this.render();
        this.attachEventsListener();
    }

    render() {
        this.innerHTML = `
        <div class="quit-tournament-pop-up-background">
            <div class="background-overlay"></div>
            <div class="quit-tournament-pop-up">
                <p>You are in a tournament</p>
                <p>stay or leave?</p>
                <div class="quit-tournament-choice-icon">
                    <p class="quit-tournament-choice-reconnect">Stay</p>
                    <p class="quit-tournament-choice-leave">Leave</p>
                </div>
            </div>
        </div>
        `
        this.inactivePopUp = document.querySelector('.quit-tournament-pop-up')
        this.reconnectChoice = document.querySelector('.quit-tournament-choice-reconnect');
        this.LeaveChoice = document.querySelector('.quit-tournament-choice-leave');
    }

    attachEventsListener() {
        this.stayChoice.addEventListener('click', () => {
            this.removeInstance();
        })
        this.LeaveChoice.addEventListener('click', async () => {            
            // await surrenderHandler();
            this.removeInstance();
        })
    }

    removeInstance() {
        QuitTournamentComponent.instance = null;
        this.remove();
    }
}

customElements.define('quit-tournament-component', QuitTournamentComponent);
