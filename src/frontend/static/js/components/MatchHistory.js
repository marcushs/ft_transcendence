import {sendRequest} from "../utils/sendRequest.js";
import getUserId from "../utils/getUserId.js";
import getUsernameById from "../utils/getUsernameById.js";

class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.classList.add('component');
    }

    async connectedCallback() {
        this.history = await sendRequest("GET", "http://localhost:8007/statistics/get_history/", null);
        this.userId = await getUserId();

        await this.initializeComponent();
        console.log('history = ', this.history);
    }


    async initializeComponent() {
        this.innerHTML = `
            <div class="match-history-container">
                <h1>Match history</h1>
                <ul class="history-list-container">
                    ${await this.generateHistoryList()}
<!--                    <li class="win">-->
<!--                        <div class="type">-->
<!--                            <p>Ranked</p>-->
<!--                            <div class="line"></div>-->
<!--                        </div>-->
<!--                        <div class="content">-->
<!--                            <p class="vs">VS</p>-->
<!--                            <p class="name">WWWWWWWWWWWW</p>-->
<!--                            <p class="score">11 - 9</p>-->
<!--                        </div>-->
<!--                    </li>-->
<!--                    <li class="win">-->
<!--                        <div class="type">-->
<!--                            <p>Ranked</p>-->
<!--                            <div class="line"></div>-->
<!--                        </div>-->
<!--                        <div class="content">-->
<!--                            <p class="vs">VS</p>-->
<!--                            <p class="name">tduprez</p>-->
<!--                            <p class="score">11 - 9</p>-->
<!--                        </div>-->
<!--                    </li>-->
<!--                    <li class="lose">-->
<!--                        <div class="type">-->
<!--                            <p>Unranked</p>-->
<!--                            <div class="line"></div>-->
<!--                        </div>-->
<!--                        <div class="content">-->
<!--                            <p class="vs">VS</p>-->
<!--                            <p class="name">acarlott</p>-->
<!--                            <p class="score">11 - 9</p>-->
<!--                        </div>-->
<!--                    </li>-->
<!--                    <li class="win">-->
<!--                        <div class="type">-->
<!--                            <p>Tournament</p>-->
<!--                            <div class="line"></div>-->
<!--                        </div>-->
<!--                        <div class="content">-->
<!--                            <p class="tournament-name">Sowoo's tournamentttdfokghnfdoihgjdfh</p>-->
<!--                            <p class="score">12-16th</p>-->
<!--                        </div>-->
<!--                    </li>-->
<!--                    <li class="lose">-->
<!--                        <div class="type">-->
<!--                            <p>Ranked</p>-->
<!--                            <div class="line"></div>-->
<!--                        </div>-->
<!--                        <div class="content">-->
<!--                            <p class="vs">VS</p>-->
<!--                            <p class="name">hleung</p>-->
<!--                            <p class="score">11 - 9</p>-->
<!--                        </div>-->
<!--                    </li>-->
                </ul>
            </div>
        `
    }


    async generateHistoryList() {
        let historyListElement = '';

        for (let item in this.history) {
            switch (item.match_type) {
                case "ranked":
                    historyListElement += await this.generateRankedItem(item);
                    break;
                case "unranked":
                    historyListElement += await this.generateUnrankedItem(item);
                    break;
                case "tournament":
                    historyListElement += this.generateTournamentItem(item);
                    break;
                default:
                    break;
            }
        }

        return historyListElement;
    }


    async generateRankedItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.winner_id : matchInfos.loser_id;
        const opponent_name = await getUsernameById(opponent_id);
        // const score = matchInfos.

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>Ranked</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">10 - 1</p>
                </div>
            </li>
        `;
    }


    async generateUnrankedItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.winner_id : matchInfos.loser_id;
        const opponent_name = await getUsernameById(opponent_id);
        // const score = matchInfos.

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>Unanked</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">10 - 1</p>
                </div>
            </li>
        `;
    }


    generateTournamentItem(matchInfos) {

    }
}

window.customElements.define('match-history-component', MatchHistory);