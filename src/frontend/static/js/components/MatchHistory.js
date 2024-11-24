import {sendRequest} from "../utils/sendRequest.js";
import getUserId from "../utils/getUserId.js";
import getUsernameById from "../utils/getUsernameById.js";
import checkAuthentication from "../utils/checkAuthentication.js";
import {getString} from "../utils/languageManagement.js";

class MatchHistory extends HTMLElement {
    constructor() {
        super();

        this.initializeComponent();
        this.classList.add('component');
    }


    async connectedCallback() {
        const isConnected = await checkAuthentication();

        if (isConnected) { 
            try {
                this.history = await sendRequest("GET", "/api/statistics/get_history/", null);
                this.userId = await getUserId();
                await this.fillHistoryList();
            } catch (error) {
                console.error(error)
            }
        } else {
            this.displayUnloggedUser();
        }
    }


    initializeComponent() {
        this.innerHTML = `
            <div class="match-history-container">
                <h1>${getString("matchHistoryComponent/matchHistory")}</h1>
                <ul class="history-list-container"></ul>
            </div>
        `;
    }


    displayUnloggedUser() {
        const matchHistoryContainer = this.querySelector('.match-history-container');
        const p = document.createElement("p");

        p.innerHTML = getString("matchHistoryComponent/unloggedSentence");
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
                    historyListElement += await this.generateTournamentItem(item);
                    break;
                case "private_match":
                    historyListElement += await this.generatePrivateMatchItem(item);
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
        const date = new Date(matchInfos.date);
        let localDate = localStorage.getItem("userLanguage");

        if (!localDate)
            localDate = 'en';

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>${getString("matchHistoryComponent/ranked")}</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
                <p class="date">${date.toLocaleDateString(localDate)}</p>
            </li>
        `;
    }


    async generateUnrankedItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.loser_id : matchInfos.winner_id;
        const opponent_name = await getUsernameById(opponent_id);
        const score = (isWin) ? `${matchInfos.winner_score} - ${matchInfos.loser_score}` : `${matchInfos.loser_score} - ${matchInfos.winner_score}`
        const date = new Date(matchInfos.date);
        let localDate = localStorage.getItem("userLanguage");

        if (!localDate)
            localDate = 'en';

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>${getString("matchHistoryComponent/unranked")}</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
                <p class="date">${date.toLocaleDateString(localDate)}</p>
            </li>
        `;
    }


    async generateTournamentItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.loser_id : matchInfos.winner_id;
        const opponent_name = await this.getAlias(opponent_id);
        const score = (isWin) ? `${matchInfos.winner_score} - ${matchInfos.loser_score}` : `${matchInfos.loser_score} - ${matchInfos.winner_score}`
        const date = new Date(matchInfos.date);
        let localDate = localStorage.getItem("userLanguage");

        console.log('test ===================', opponent_name)
        if (!localDate)
            localDate = 'en';

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>${getString("matchHistoryComponent/tournament")}</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
                <p class="date">${date.toLocaleDateString(localDate)}</p>
            </li>
        `;
    }


    async generatePrivateMatchItem(matchInfos) {
        const isWin = matchInfos.winner_id === this.userId;
        const opponent_id = (isWin) ? matchInfos.loser_id : matchInfos.winner_id;
        const opponent_name = await getUsernameById(opponent_id);
        const score = (isWin) ? `${matchInfos.winner_score} - ${matchInfos.loser_score}` : `${matchInfos.loser_score} - ${matchInfos.winner_score}`
        const date = new Date(matchInfos.date);
        let localDate = localStorage.getItem("userLanguage");

        if (!localDate)
            localDate = 'en';

        return `
            <li class="${(isWin) ? "win" : "lose"}">
                <div class="type">
                    <p>${getString("matchHistoryComponent/private_match")}</p>
                    <div class="line"></div>
                </div>
                <div class="content">
                    <p class="vs">VS</p>
                    <p class="name">${opponent_name}</p>
                    <p class="score">${score}</p>
                </div>
                <p class="date">${date.toLocaleDateString(localDate)}</p>
            </li>
        `;
    }

    async getAlias(id) {
        const url = `/api/tournament/get_alias_by_id/?player_id=${id}`;

        try {
            const data = await sendRequest('GET', url, null);

            return data.alias;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

window.customElements.define('match-history-component', MatchHistory);