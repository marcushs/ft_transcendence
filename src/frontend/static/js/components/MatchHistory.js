class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.innerHTML = `
            <div class="match-history-container">
                <h1>Match history</h1>
                <ul class="history-list-container">
                    <li class="win">
                        <div class="type">
                            <p>Ranked</p>
                            <div class="line"></div>
                        </div>
                        <div class="content">
                            <p class="vs">VS</p>
                            <p class="name">WWWWWWWWWWWW</p>
                            <p class="score">11 - 9</p>
                        </div>
                    </li>
                    <li class="win">
                        <div class="type">
                            <p>Ranked</p>
                            <div class="line"></div>
                        </div>
                        <div class="content">
                            <p class="vs">VS</p>
                            <p class="name">tduprez</p>
                            <p class="score">11 - 9</p>
                        </div>
                    </li>
                    <li class="lose">
                        <div class="type">
                            <p>Unranked</p>
                            <div class="line"></div>
                        </div>
                        <div class="content">
                            <p class="vs">VS</p>
                            <p class="name">acarlott</p>
                            <p class="score">11 - 9</p>
                        </div>
                    </li>
                    <li class="win">
                        <div class="type">
                            <p>Tournament</p>
                            <div class="line"></div>
                        </div>
                        <div class="content">
                            <p class="tournament-name">Sowoo's tournamentttdfokghnfdoihgjdfh</p>
                            <p class="score">12-16th</p>
                        </div>
                    </li>
                    <li class="lose">
                        <div class="type">
                            <p>Ranked</p>
                            <div class="line"></div>
                        </div>
                        <div class="content">
                            <p class="vs">VS</p>
                            <p class="name">hleung</p>
                            <p class="score">11 - 9</p>
                        </div>
                    </li>
                </ul>
            </div>
        `

        this.classList.add('component');

    }
}

window.customElements.define('match-history-component', MatchHistory);