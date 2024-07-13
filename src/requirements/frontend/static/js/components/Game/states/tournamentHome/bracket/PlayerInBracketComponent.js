import sleep from "../../../../../utils/sleep.js";

class PlayerInBracketComponent extends HTMLElement {
    // static get observedAttributes() {
    //     return ['name', 'score', 'class', 'left', 'right'];
    // }
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
        this.attachEventsListener();
    }

    connectedCallback() {
        const name = this.querySelector('.player-name > p');
        const nameContainer = getComputedStyle(this.querySelector('.player-name'));

        this.reduceFontSize(name, nameContainer);
    }

    attachEventsListener() {
        const name = this.querySelector('.player-name > p');
        const nameContainer = getComputedStyle(this.querySelector('.player-name'));

        document.addEventListener('animationstart', event => {
            if (event.animationName === 'move-game-to-center') {
                this.handleExtendGameAndResizeFont(event, name, nameContainer);
            }
        });

        document.querySelector('.reduce-game-button').addEventListener('click', event => {
            this.handleReduceGameAndResizeFont(event, name, nameContainer)
        });

    }

    reduceFontSize(name, nameContainer) {
        while (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4 && this.convertFontSizePixelToRem(name) >= 1) {
            name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) - 0.1}px`;
        }
        if (parseFloat(getComputedStyle(name).width) > parseFloat(nameContainer.width) - 4) {
            name.className = 'overflow-name';
        }
    }

    async handleExtendGameAndResizeFont(event, name, nameContainer) {
        if (name.className === 'overflow-name') {
            name.className = '';
        }
        await sleep(120);
        while (parseFloat(getComputedStyle(name).width) < parseFloat(nameContainer.width) - 4 && this.convertFontSizePixelToRem(name) < 1.8) {
            name.style.fontSize = `${parseFloat(getComputedStyle(name).fontSize) + 0.1}px`;
        }
    }

    handleReduceGameAndResizeFont(event, name, nameContainer) {
        name.style.fontSize = '1.5rem';
        this.reduceFontSize(name, nameContainer);
    }

    convertFontSizePixelToRem(element) {
        const rootSizeInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

        return parseFloat(getComputedStyle(element).fontSize) / rootSizeInPx;
    }

}

customElements.define('player-in-bracket', PlayerInBracketComponent);