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
        const name = this.querySelector('.player-name > p');
        const nameContainer = getComputedStyle(this.querySelector('.player-name'));

        while (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4 && this.convertFontSizePixelToRem(name) >= 1) {
            name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) - 1}px`;
        }

        if (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4) {
            name.className = 'overflow-name';
        }

        document.addEventListener('game-extended', () => {
                while (parseFloat(getComputedStyle(name).width) < parseFloat(nameContainer.width) - 4 && this.convertFontSizePixelToRem(name) < 1.8) {
                    console.log('test');
                    name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) + 0.1}px`;
                }
                console.log(parseFloat(getComputedStyle(name).width), parseFloat(nameContainer.width) - 4, getComputedStyle(name).fontSize);
        });

        document.addEventListener('game-reduced', () => {
            if (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4) {
                while (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4 && this.convertFontSizePixelToRem(name) >= 1) {
                    name.fontSize = `${parseFloat(getComputedStyle(name).fontSize) - 1}px`;
                }
            }
            else {
                while (this.convertFontSizePixelToRem(name) >= 1.5) {
                    name.fontSize = `${parseFloat(getComputedStyle(name).fontSize) - 1}px`;
                }
            }
        });
    }

    convertFontSizePixelToRem(element) {
        const rootSizeInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

        return parseFloat(getComputedStyle(element).fontSize) / rootSizeInPx;
    }

}

customElements.define('player-in-bracket', PlayerInBracketComponent);