class PlayerInBracketComponent extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'score', 'class', 'left', 'right'];
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

    connectedCallback() {
        const nameContainer = this.querySelector('.player-name');
        const name = this.querySelector('.player-name > p');

        let i = 0;
        console.log(parseFloat(getComputedStyle(name).fontSize));
        while (name.offsetWidth > nameContainer.offsetWidth - 4 && parseFloat(getComputedStyle(name).fontSize) >= 10) {
            name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) - 1}px`;
            i++;
        }
        if (name.offsetWidth > nameContainer.offsetWidth - 4) {
            name.className = 'overflow-name';
        }
    }

}

customElements.define('player-in-bracket', PlayerInBracketComponent);