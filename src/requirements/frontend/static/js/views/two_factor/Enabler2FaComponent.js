import enableHome from './states/enableHome.js'
import methodChoice from './states/methodChoice.js'
import tokenVerify from './states/tokenVerify.js'
import enableDone from './states/enableDone.js'

class TwoFactorEnablerComponent extends HTMLElement {
    constructor() {
        super();

        this.states = {
            "enableHome": { context: '/profile/2fa/enable', state: enableHome},
            "MethodChoice": { context: '/profile/2fa/enable/method', state: methodChoice},
            "tokenVerify": { context: '/profile/2fa/enable/verify', state: tokenVerify},
            "enableSucces": { context: '/profile/2fa/enable/done', state: enableDone},
        };
        this.innerHTML = `<div id="states-container"></div>`
        this.stateContainer = document.querySelector('.states-container');
        this.currentContext = this.states["enableHome"].context;
        this.currentState = "enableHome";

        this.pushNewState(this.states[this.currentState].state);
        this.attachEventListener();
    }

    pushNewState(state) {
        this.stateContainer.innerHTML = state.render();
        // this.stateContainer.classList.add(state.class);
    }

    removeCurrentState() {
        this.stateContainer.innerHTML = '';
        // this.stateContainer.classList.remove(this.states[this.currentState].state.class);
    }

    changeState(state, context) {
        this.removeCurrentState();
        this.pushNewState(state);
        this.currentContext = context;
    }

    attachEventListener() {
        this.stateContainer.addEventListener('click', (event) => {
            if (event.target.hasAttribute('state-redirect'))
                this.handleStateRedirection(event);
        });
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

    handleBackRedirection() {
        const lastSlashIndex = this.currentContext.lastIndexOf('/');
        const statesArray = Object.entries(this.states);
        let newContext;

        (lastSlashIndex > 19) ? newContext = this.currentContext.slice(0, lastSlashIndex) : newContext = "/profile/2fa/enable";
        for (const stateItem of statesArray) {
            if (newContext === stateItem[1].context) {
                this.changeState(stateItem[1].state, newContext);
                this.currentState = stateItem[0];
                break ;
            }
        }
    }
}

customElements.define("two-factor-enabler-component", TwoFactorEnablerComponent);