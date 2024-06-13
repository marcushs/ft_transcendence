import "./SearchBar.js"

class NavBarComponent extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <nav>
                <div class="nav-bar-section nav-bar-left-section">
                    <div class="logo"></div>
                    <a class="nav-bar-link">Home</a>
                    <div is="search-bar-component"></div>
                </div>
                <div class="nav-bar-section nav-bar-right-section">
                    <img src="../../assets/bell.svg" alt="notifs-bell">
                    <p>acarlott</p>
                    <div class="profile-picture"></div>
                </div>
            </nav>
        `;

        this.classList.add('component');
    }
}

customElements.define("nav-bar-component", NavBarComponent);