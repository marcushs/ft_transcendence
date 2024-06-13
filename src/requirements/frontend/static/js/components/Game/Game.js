import './states/matchmakingChoice.js'
import { matchmakingChoiceClass, matchmakingChoice } from "./states/matchmakingChoice.js";
import tournament from "./states/tournament.js";

class GameComponent extends HTMLElement {
    constructor() {
        super();


        this.states = {
            "matchmakingChoice": { className: matchmakingChoiceClass, render: matchmakingChoice },
            "tournamentPage": tournament
        }

        this.innerHTML = `
            <div class="game-background"></div>
            <div class="states-container"></div>
            <div class="opacity-foreground"></div>
            <div class="left-player-paddle"></div>
            <div class="right-player-paddle"></div>
            <div class="middle-line"></div>
        `;

        this.statesContainer = this.querySelector('.states-container');

        this.pushState("matchmakingChoice");
    }

    pushState(stateName) {
        this.statesContainer.innerHTML = this.states[stateName].render();
        this.statesContainer.classList.add(this.states[stateName].className);
    }

    removeState(stateName) {
        this.statesContainer.innerHTML = '';
        this.statesContainer.classList.remove(this.states[stateName].className);
    }

    changeState(stateName) {
        this.removeState(stateName);
        this.pushState(stateName);
    }
}



customElements.define("game-component", GameComponent);