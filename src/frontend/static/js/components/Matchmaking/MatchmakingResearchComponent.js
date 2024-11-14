import { sendRequest } from "../../utils/sendRequest.js";
import { matchmakingSocket } from "../../utils/matchmaking/matchmakingWebsocket.js";

class MatchmakingResearchComponent extends HTMLElement {
    constructor() {
        super();
        this.isSearching = JSON.parse(localStorage.getItem('isSearchingGame'));
        this.isResearchRendered = document.querySelector('matchmaking-research-component');
        this.cancelResearchEventHandler = async () => await this.cancelMatchmakingResearch();
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
        });

        document.addEventListener('cancelMatchmakingResearchEvent', this.cancelResearchEventHandler);
    }

    async cancelMatchmakingResearch() {
        try {
            const response = await sendRequest('POST', '/api/matchmaking/remove_waiting/', null);
            if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
                matchmakingSocket.close();
            this.style.animation = "ease-in 0.25s animate-opacity forwards";
            localStorage.removeItem('isSearchingGame');
            console.log('remove response: ', response);
            setTimeout(() => {
                this.throwMatchmakingResearchCanceledEvent();
                this.remove();
            }, 250);
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
    }

    setInitialRender() {
        this.render()
    }

    throwMatchmakingResearchCanceledEvent() {
        const event = new CustomEvent('matchmakingResearchCanceledEvent', {
            bubbles: true
        });

        document.dispatchEvent(event);
    }


    disconnectedCallback() {
        document.removeEventListener('cancelMatchmakingResearchEvent', this.cancelResearchEventHandler);
    }

}

customElements.define('matchmaking-research-component', MatchmakingResearchComponent);  