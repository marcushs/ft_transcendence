class MatchmakingResearchComponent extends HTMLElement {
    constructor() {
        super();
        this.isSearching = localStorage.getItem('isSearchingGame');
    }

    connectedCallback() {
        if (!this.isSearching)
            return
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class='matchmaking-research'>
                <p class='matchmaking-research-title'>Search for ${this.isSearching} game</p>
                <div class='matchmaking-search-indicator'>
                    <div class='matchmaking-search-indicator-bar'></div>
                    <div class='matchmaking-search-indicator-bar'></div>
                    <div class='matchmaking-search-indicator-bar'></div>
                </div>
                <div class='cancel-matchmaking-research-icon'>
                    <p>Cancel</p>
                </div>
            </div>
        `
        this.loadingIcon = document.querySelector('.matchmaking-research-loading-icon');
        this.researchInfo = document.querySelector('.matchmaking-research-info');
        this.cancelResearchIcon = document.querySelector('.cancel-matchmaking-research-icon');
    }

    attachEventListener() {
        this.cancelResearchIcon.addEventListener('click', () => {
            this.cancelMatchmakingResearch();
        })
    }

    cancelMatchmakingResearch() {
        console.log('Cancel method reached');
        // localStorage.removeItem('isSearchingGame');
        // this.remove();
    }
}

customElements.define('matchmaking-research-component', MatchmakingResearchComponent);