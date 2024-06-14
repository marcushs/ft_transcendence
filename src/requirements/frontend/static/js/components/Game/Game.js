import './states/matchmakingChoice.js'
import './GameTopBar.js'
import matchmakingChoice from "./states/matchmakingChoice.js";
import tournamentHome from "./states/tournamentHome.js";
import onlineHome from "./states/onlineHome.js";
import localHome from "./states/localHome.js";

class GameComponent extends HTMLElement {
    constructor() {
        super();

        this.states = {
            "matchmakingChoice": { context: "/", state: new matchmakingChoice() },
            "tournamentHome": { context: "/tournamentHome", state: new tournamentHome() },
            "onlineHome": { context: "/onlineHome", state: new onlineHome() },
            "localHome": { context: "/localHome", state: new localHome() }
        }

        this.innerHTML = `
            <div class="game-background"></div>
            <div class="states-container"></div>
            <game-top-bar></game-top-bar>
            <div class="left-player-paddle"></div>
            <div class="right-player-paddle"></div>
            <div class="middle-line"></div>
        `;

        this.statesContainer = this.querySelector('.states-container');
        this.backButton = this.querySelector('.back-button');
        this.currentContext = this.states["matchmakingChoice"].context;

        this.pushState(this.states["matchmakingChoice"].state);

        this.attachEventListener();
    }

    pushState(state) {
        this.statesContainer.innerHTML = state.render();
        this.statesContainer.classList.add(state.class);
    }

    removeState(state) {
        this.statesContainer.innerHTML = '';
        this.statesContainer.classList.remove(state.className);
    }

    changeState(state, context) {
        this.removeState(state);
        this.pushState(state);
        this.currentContext = context;
        this.manageBackButtonDisplay();
    }

    manageBackButtonDisplay() {
        if (this.currentContext === '/' && this.backButton.style.display === 'flex') {
            this.backButton.style.display = '';
        } else if (this.currentContext !== '/' && this.backButton.style.display === '') {
            this.backButton.style.display = 'flex';
        }
    }

    attachEventListener() {
        this.statesContainer.addEventListener('click', (event) => {
            if (event.target.hasAttribute('state-redirect')) {
                this.handleStateRedirection(event);
            }
        });

        this.addEventListener('navigate-back', (event) => {
            this.handleBackRedirection(event);
        });

    }

    handleStateRedirection(event) {
        const statesArray = Object.values(this.states);

        for (const stateItem of statesArray) {
            if (event.target.hasAttribute(stateItem.state.redirectState)) {
                this.changeState(stateItem.state, stateItem.context);
                break ;
            }
        }
    }

    handleBackRedirection(event) {
        const lastSlashIndex = this.currentContext.lastIndexOf('/');
        const statesArray = Object.values(this.states);
        let newContext;

        (lastSlashIndex > 0) ? newContext = this.currentContext.slice(0, lastSlashIndex) : newContext = "/";

        for (const stateItem of statesArray) {
            if (newContext === stateItem.context) {
                this.changeState(stateItem.state, newContext);
                break ;
            }
        }
    }

}

customElements.define("game-component", GameComponent);