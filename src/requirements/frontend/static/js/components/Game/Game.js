import './states/matchmakingChoice.js'
import './GameTopBar.js'
import reduceGameComponent from "../../anim/reduceGameComponent.js";
import extendGameComponent from "../../anim/extendGameComponent.js";
import matchmakingChoice from "./states/matchmakingChoice.js";
import tournamentHome from "./states/tournamentHome/tournamentHome.js";
import onlineHome from "./states/onlineHome/onlineHome.js";
import localHome from "./states/localHome/localHome.js";
import bracket from "./states/tournamentHome/bracket/bracket.js";

class GameComponent extends HTMLElement {
    constructor() {
        super();

        this.states = {
            "matchmakingChoice": { context: "/", state: new matchmakingChoice() },
            "tournamentHome": { context: "/tournamentHome", state: new tournamentHome() },
            "onlineHome": { context: "/onlineHome", state: new onlineHome() },
            "localHome": { context: "/localHome", state: new localHome() },
            "bracket": {context: "/tournamentHome/bracket", state: new bracket()}
        }

        this.innerHTML = `
            <div class="game-background"></div>
            <div class="states-container">
            </div>
            <game-top-bar></game-top-bar>
        `;

        this.statesContainer = this.querySelector('.states-container');
        this.backButton = this.querySelector('.back-button');
        this.currentContext = this.states["matchmakingChoice"].context;
        this.currentState = "matchmakingChoice";

        this.pushNewState(this.states[this.currentState].state);

        this.attachEventListener();
    }

    pushNewState(state) {
        this.statesContainer.innerHTML = `<div class="left-player-paddle"></div>
                <div class="right-player-paddle"></div>
                <div class="middle-line"></div>`
                + state.render();

        this.statesContainer.classList.add(state.class);
    }

    removeCurrentState() {
        this.statesContainer.innerHTML = '';
        this.statesContainer.classList.remove(this.states[this.currentState].state.class);
    }

    changeState(state, context) {
        this.removeCurrentState();
        this.pushNewState(state);
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
            if (event.target.hasAttribute('state-redirect')) {
                this.handleStateRedirection(event);
            }
        });

        this.addEventListener('navigate-back', (event) => this.handleBackRedirection(event));

        this.addEventListener('extend-game', () => extendGameComponent(this));

        this.addEventListener('reduce-game', () => reduceGameComponent(this));

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

}

customElements.define("game-component", GameComponent);