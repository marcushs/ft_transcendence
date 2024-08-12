class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <div class="match-history-container">
                <h1>History</h1>
            </div>
        `

        this.classList.add('component');

    }
}

window.customElements.define('match-history-component', MatchHistory);