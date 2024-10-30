import {sendRequest} from "../utils/sendRequest.js";
import getUserId from "../utils/getUserId.js";
import getUsernameById from "../utils/getUsernameById.js";

class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.initializeComponent();
        this.classList.add('component');
    }

    async connectedCallback() {
        this.history = await sendRequest("GET", "/api/statistics/get_history/", null);
        this.userId = await getUserId();

        await this.fillHistoryList();

        console.log('history = ', this.history);
    }


    initializeComponent() {
        this.innerHTML = `
            <div class="match-history-container">
                <h1>Match history</h1>
                <ul class="history-list-container">
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
                </ul>
            </div>
        `
    }


    async fillHistoryList() {
        const ul = this.querySelector('ul');

        ul.innerHTML = await this.generateHistoryList();
    }


    async generateHistoryList() {
        let historyListElement = '';

        for (let item of this.history) {
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
        const opponent_id = (isWin) ? matchInfos.loser_id : matchInfos.winner_id;
        const opponent_name = await getUsernameById(opponent_id);
        const score = (isWin) ? `${matchInfos.winner_score} - ${matchInfos.loser_score}` : `${matchInfos.loser_score} - ${matchInfos.winner_score}`

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>Ranked</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
            </li>
        `;
    }


    async generateUnrankedItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.loser_id : matchInfos.winner_id;
        const opponent_name = await getUsernameById(opponent_id);
        const score = (isWin) ? `${matchInfos.winner_score} - ${matchInfos.loser_score}` : `${matchInfos.loser_score} - ${matchInfos.winner_score}`

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>Unranked</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
            </li>
        `;
    }


    generateTournamentItem(matchInfos) {

    }
}

window.customElements.define('match-history-component', MatchHistory);