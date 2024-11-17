import './states/matchmakingChoice.js'
import './GameTopBar.js'
import reduceGameComponent from "../../anim/reduceGameComponent.js";
import extendGameComponent from "../../anim/extendGameComponent.js";
import matchmakingChoice from "./states/matchmakingChoice.js";
import tournamentHome from "./states/tournamentHome/tournamentHome.js";
import onlineHome from "./states/onlineHome/onlineHome.js";
import localHome from "./states/localHome/localHome.js";
import bracket from "./states/tournamentHome/bracket/bracket.js";
import rotatingGradient from "../../anim/rotatingGradient.js";
import TournamentMatch from './states/tournamentHome/TournamentMatch.js';

class GameComponent extends HTMLElement {
    constructor() {
        super();

        this.states = {
            "matchmakingChoice": { context: "/", state: new matchmakingChoice() },
            "tournamentHome": { context: "/tournamentHome", state: new tournamentHome() },
            "onlineHome": { context: "/onlineHome", state: new onlineHome() },
            "localHome": { context: "/localHome", state: new localHome() },
            "bracket": {context: "/tournamentHome/tournamentMatch/bracket"},
            "tournamentWaitingRoom": {context: "/tournamentHome/tournamentWaitingRoom"},
            "tournamentMatch": {context: "/tournamentHome/tournamentMatch"},
            "tournamentLost": {context: "/tournamentHome/tournamentLost"},
        }

        this.innerHTML = `
            <div class="game-background"></div>
            <div class="states-container" id="gameStatesContainer"></div>
            <game-top-bar></game-top-bar>
        `;

        this.statesContainer = this.querySelector('.states-container');
        this.backButton = this.querySelector('.back-button');
        this.currentContext = this.states["matchmakingChoice"].context;
        this.currentState = "matchmakingChoice";


        this.attachEventListener();
    }

    async connectedCallback() {
        await this.pushNewState(this.states[this.currentState].state);
        rotatingGradient('game-component', '#FF16C6', '#00D0FF');
        rotatingGradient('.game-background', '#FF16C6', '#00D0FF');
    }

    async pushNewState(state) {
        this.statesContainer.innerHTML = `
                <div class="left-player-paddle"></div>
                <div class="right-player-paddle"></div>
                <div class="middle-line"></div>` + await state.render();
        this.statesContainer.classList.add(state.class);
    }

    removeCurrentState() {
        this.statesContainer.innerHTML = '';
        this.statesContainer.classList.remove(this.states[this.currentState].state.class);
    }

    async changeState(state, context) {
        this.removeCurrentState();
        await this.pushNewState(state);
        this.currentContext = context;
        this.manageBackButtonDisplay();
    }

    manageBackButtonDisplay() {
        const computedVisibility = getComputedStyle(this.backButton).visibility;

        if (this.currentContext === '/' && computedVisibility === 'visible') {
            this.backButton.style.visibility = 'hidden';
        } else if (this.currentContext !== '/' && computedVisibility === 'hidden') {
            this.backButton.style.visibility = 'visible';
        }
    }

    attachEventListener() {
        this.statesContainer.addEventListener('click', (event) => {
            if (event.target.hasAttribute('state-redirect') && event.target.className !== 'unavailable-matchmaking-choice') {
                this.handleStateRedirection(event);
            }
        });

        this.addEventListener('navigate-back', (event) => this.handleBackRedirection(event));

        this.addEventListener('extend-game', () => extendGameComponent(this));

        this.addEventListener('reduce-game', () => reduceGameComponent(this));

        document.addEventListener('changeGameStateEvent', (event) => this.handleChangeStateEvent(event));

    }

    handleStateRedirection(event) {
        const statesArray = Object.entries(this.states);

        for (const stateItem of statesArray) {
            if (event.target.hasAttribute(stateItem[1].state.redirectState)) {
                this.changeState(stateItem[1].state, stateItem[1].context);
                this.currentState = stateItem[0];
                break ;
            }
        }
    }

    handleBackRedirection(event) {
        const lastSlashIndex = this.currentContext.lastIndexOf('/');
        const statesArray = Object.entries(this.states);
        let newContext;

        (lastSlashIndex > 0) ? newContext = this.currentContext.slice(0, lastSlashIndex) : newContext = "/";

        for (const stateItem of statesArray) {
            if (newContext === stateItem[1].context) {
                this.changeState(stateItem[1].state, newContext);
                this.currentState = stateItem[0];
                break ;
            }
        }
    }


    async handleChangeStateEvent(event) {
        if (event.detail.context === "onlineHome") {
            await this.changeState(this.states[event.detail.context].state, this.states[event.detail.context].context);
        }
    }

}

customElements.define("game-component", GameComponent);
