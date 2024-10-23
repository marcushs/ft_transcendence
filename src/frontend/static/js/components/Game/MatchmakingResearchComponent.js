import { throwMatchmakingResearchEvent } from "../../utils/throwEvent/throwMatchmakingResearchEvent.js";
import checkAuthentication from "../../utils/checkAuthentication.js";
import { matchmakingSocket, matchmakingWebsocket } from "./matchmakingWebsocket.js";
import { sendRequest } from "../../utils/sendRequest.js";


export async function checkMatchmakingSearch() {
    const isSearching = localStorage.getItem('isSearchingGame');
    const isUserConnected = await checkAuthentication();
    if (isSearching && isUserConnected) {
        if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/profile') && !window.location.pathname.startsWith('/users/')) {
            if (document.querySelector('matchmaking-research-component'))
                document.removeChild('matchmaking-research-component');
            return;
        }        
        if (!matchmakingSocket || matchmakingSocket.readyState !== WebSocket.OPEN)
            await matchmakingWebsocket();
        throwMatchmakingResearchEvent();
    }
}

class MatchmakingResearchComponent extends HTMLElement {
    constructor() {
        super();
        this.isSearching = localStorage.getItem('isSearchingGame');
        this.isResearchRendered = document.querySelector('matchmaking-research-component');
    }

    connectedCallback() {
        if (!this.isSearching || this.isResearchRendered) {
            this.remove();
            return;
        }
        this.render();
        this.attachEventListener();
    }

    render() {
        this.innerHTML = `
            <div class='matchmaking-research matchmaking-research-processing'>
                <div class="matchmaking-research-section">                
                    <p class='matchmaking-research-title'>Searching ${this.isSearching} game</p>
                    <div class='matchmaking-search-indicator'>
                        <div class='matchmaking-search-indicator-bar'></div>
                        <div class='matchmaking-search-indicator-bar'></div>
                        <div class='matchmaking-search-indicator-bar'></div>
                    </div>
                </div>
                <div class='cancel-matchmaking-research-icon'>
                    <p>Cancel</p>
                </div>
            </div>
        `
        this.mainDiv = this.querySelector('.matchmaking-research')
        this.popUpTitle = this.querySelector('.matchmaking-research-title');
        this.loadingIcon = document.querySelector('.matchmaking-research-loading-icon');
        this.researchInfo = document.querySelector('.matchmaking-research-info');
        this.cancelResearchIcon = document.querySelector('.cancel-matchmaking-research-icon');        
    }

    attachEventListener() {
        this.cancelResearchIcon.addEventListener('click', async () => {
            await this.cancelMatchmakingResearch();
        })
    }

    async cancelMatchmakingResearch() {
        try {
            const response = await sendRequest('POST', 'http://localhost:8006/matchmaking/remove_waiting/', null);
            console.log('remove response: ', response);
            this.classList.add('matchmaking-research-component-hide');
            console.log('Cancel method reached');
            localStorage.removeItem('isSearchingGame');
            setTimeout(() => {
                this.remove();
            }, 500);
        } catch (error) {
            this.remove();
            console.error(error.message);
        }

    }

    setFoundGameRender() {
        this.popUpTitle.textContent = `Joining ${this.isSearching} game`;
        this.cancelResearchIcon.remove();
        this.mainDiv.classList.remove('matchmaking-research-processing');
		this.mainDiv.classList.add('matchmaking-research-finished');
        document.createElement('div')
        console.log('setFoundGameRender Reached !: ', this);
    }

    setInitialRender() {
        this.render()
    }
}

customElements.define('matchmaking-research-component', MatchmakingResearchComponent);  