import "./SearchBar.js"

class NavBar extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <nav class="nav-bar">
                <div class="nav-bar-section nav-bar-left-section">
                    <div class="logo"></div>
                    <a class="nav-bar-link">Home</a>
                    <div is="search-bar"></div>
                </div>
                <div class="nav-bar-section nav-bar-right-section">
                    <img src="../../assets/bell.svg" alt="notifs-bell">
                    <p>acarlott</p>
                    <div class="profile-picture"></div>
                </div>
            </nav>
        `;

        // this.classList.add('nav-bar');
    }
}

customElements.define("nav-bar", NavBar);