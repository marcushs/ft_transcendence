class GameComponent extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <div class="game-gradient"></div>
            <div class="game-container">
            	<h1>test</h1>
            </div>
        `;

    }
}

customElements.define("game-component", GameComponent);