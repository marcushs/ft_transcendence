class PlayerInBracketComponent extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'score', 'class'];
    }

    constructor() {
        super();

        this.innerHTML = `
            <div class="player-name">
                <p>${this.getAttribute('name')}</p>
            </div>
            <div class="score">
                <p>${this.getAttribute('score')}</p>
            </div>
        `;

        this.className =  this.getAttribute('class');
    }

}

customElements.define('player-in-bracket', PlayerInBracketComponent);