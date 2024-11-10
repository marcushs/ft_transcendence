import {sendRequest} from "../utils/sendRequest.js";
import getUserId from "../utils/getUserId.js";
import getUsernameById from "../utils/getUsernameById.js";
import checkAuthentication from "../utils/checkAuthentication.js";

class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.initializeComponent();
        this.classList.add('component');
    }


    async connectedCallback() {
        const isConnected = await checkAuthentication();


        if (isConnected) {
            this.history = await sendRequest("GET", "/api/statistics/get_history/", null);
            this.userId = await getUserId();
            await this.fillHistoryList();
        } else {
            this.displayUnloggedUser();
        }
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
        `;
    }


    displayUnloggedUser() {
        console.log('test')
        const matchHistoryContainer = this.querySelector('.match-history-container');
        const p = document.createElement("p");

        p.innerHTML = "To access to match history, please login or sign in.";
        p.className = "unlogged-sentence";

        matchHistoryContainer.appendChild(p);
        matchHistoryContainer.querySelector('h1').style.color = "#8C8FA4";
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
        console.log('opponent_id = ', opponent_id);
        const opponent_name = await getUsernameById(opponent_id);
        console.log('opponent_name = ', opponent_name);
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