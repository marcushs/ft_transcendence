import typeAndReplaceWords from "../anim/typeAndReplaceWords.js";
import {getString} from "../utils/languageManagement.js";

class SearchBarComponent extends HTMLDivElement {
    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();

        this.innerHTML = `
            <div class="search-bar">
                <form action="#" autocomplete="off">
                    <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                    <div class="search-bar-input-container">
                        <input type="text" placeholder="${getString('searchBarComponent/search')} " id="searchBarInput"/>
                    </div>
                </form>
             </div>
        `;

        this.classList.add('component');
    }


    connectedCallback() {
        typeAndReplaceWords();
    }
}

customElements.define("search-bar-component", SearchBarComponent, { extends: "div" });