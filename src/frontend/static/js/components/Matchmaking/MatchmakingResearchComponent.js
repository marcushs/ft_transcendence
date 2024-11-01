import { sendRequest } from "../../utils/sendRequest.js";
import { matchmakingSocket } from "../../utils/matchmaking/matchmakingWebsocket.js";

class MatchmakingResearchComponent extends HTMLElement {
    constructor() {
        super();
        this.isSearching = JSON.parse(localStorage.getItem('isSearchingGame'));
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
                    <p class='matchmaking-research-title'>Searching ${this.isSearching.type} game</p>
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
            const response = await sendRequest('POST', '/api/matchmaking/remove_waiting/', null);
            if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
                matchmakingSocket.close();
            this.classList.add('matchmaking-research-component-hide');
            localStorage.removeItem('isSearchingGame');
            console.log('remove response: ', response);
            setTimeout(() => {
                this.remove();
            }, 500);
        } catch (error) {
            this.remove();
            console.error(error.message); 
        }

    }

    setFoundGameRender() {
        this.isSearching.status = 'joining';
        localStorage.setItem('isSearchingGame', JSON.stringify(this.isSearching));
        this.popUpTitle.textContent = `Joining ${this.isSearching.type} game`;
        this.cancelResearchIcon.remove();
        this.mainDiv.classList.remove('matchmaking-research-processing');
		this.mainDiv.classList.add('matchmaking-research-finished');
        document.createElement('div')
    }

    setInitialRender() {
        this.render()
    }
}

customElements.define('matchmaking-research-component', MatchmakingResearchComponent);  