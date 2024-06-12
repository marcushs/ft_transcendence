class SearchBar extends HTMLDivElement {
    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();

        this.innerHTML = `
            <div class="search-bar">
                <form action="#">
                    <img src="../../assets/search-bar-icon.svg" alt="search-bar-icon" class="search-bar-icon">
                    <div class="search-bar-input-container">
                        <input type="text" placeholder="Search" id="searchBarInput"/>
                    </div>
                </form>
             </div>
        `;
    }
}

customElements.define("search-bar", SearchBar, { extends: "div" });