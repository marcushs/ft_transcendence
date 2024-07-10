import enableHome from './states/enableHome.js'
import methodChoice from './states/methodChoice.js'
import tokenVerify from './states/tokenVerify.js'
import enableDone from './states/enableDone.js'
import profile from "../../views/profile.js";

class TwoFactorEnablerComponent extends HTMLElement {
    constructor() {
        super();

        this.initialize()
    }

    async initialize() {
        this.states = {
            "enableHome": { context: '/profile/2fa/enable', state: new enableHome},
            "methodChoice": { context: '/profile/2fa/enable/method', state: new methodChoice},
            "tokenVerify": { context: '/profile/2fa/enable/method/verify', state: new tokenVerify},
            "enableDone": { context: '/profile/2fa/enable/method/verify/done', state: new enableDone},
        };
        this.selectedMethod = "N/A";
        this.innerHTML = `<div class="states-container"></div>`
        this.stateContainer = document.querySelector('.states-container');
        this.currentContext = this.states["enableHome"].context;
        this.currentState = "enableHome";
        
        await this.states[this.currentState].state.isConnectedUser()
        this.pushNewState(this.states[this.currentState].state);
        this.attachEventListener();
    }

    pushNewState(state) {
        this.stateContainer.innerHTML = state.render();
    }

    removeCurrentState() {
        this.stateContainer.innerHTML = '';
    }

    changeState(state, context) {
        this.removeCurrentState();
        this.pushNewState(state);
        this.currentContext = context;
    }

    async attachEventListener() {
        this.stateContainer.addEventListener('click', (event) => {
            if (event.target.hasAttribute('state-redirect')) {
                if (event.target.id === 'next-button')
                    this.handleStateRedirection(event);
                else
                    this.handleBackRedirection();
            }
        });
    }

    async handleStateInstruction() {
        switch (this.currentState) {
            case "enableDone":
                this.handleProfileRedirection();
                break;
            case "methodChoice":
                this.selectedMethod = this.states[this.currentState].state.getSelectedMethod();
                const responseStatus = await this.states[this.currentState].state.enableTwoFactorRequest(this.selectedMethod);
                if (responseStatus === 403)
                    this.handleProfileRedirection()
                this.states["tokenVerify"].state.setSelectedMethod(this.selectedMethod);
                break;
            case "tokenVerify":
                await this.states[this.currentState].state.VerifyTwoFactorRequest();
                break;
        }
    }

    async handleStateRedirection(event) {
        try {
            await this.handleStateInstruction();
        } catch (error) {
            alert(`Error: Two factor: ${error.message}`);
            return;
        }
        const statesArray = Object.entries(this.states);

        for (const stateItem of statesArray) {
            if (event.target.hasAttribute(stateItem[1].state.redirectState)) {
                this.changeState(stateItem[1].state, stateItem[1].context);
                this.currentState = stateItem[0];
                if (this.currentState === 'tokenVerify') {
                    const form = document.querySelector('.twofactor-form'); // add this event for prevent reloading of the page when we press enter, maybe change this to better handling ?
                        if (form) {
                            form.addEventListener('submit', async (event) => {
                                event.preventDefault();
                            });
                        }
                    if (this.states[this.currentState].state.selectedMethod === 'authenticator')
                        this.states[this.currentState].state.displayQRCode();
                }
                break ;
            }
        }
    }

    handleBackRedirection() {
        if (this.currentState === "enableHome")
            this.handleProfileRedirection();
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

    handleProfileRedirection() {
        const app = document.querySelector('#app');
        
        if (app) {
            app.innerHTML = '';
            history.pushState("", "", "/profile");
            app.innerHTML = profile();
        }
    }
}

customElements.define("two-factor-enabler-component", TwoFactorEnablerComponent);