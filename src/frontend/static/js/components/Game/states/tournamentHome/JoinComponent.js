import {getString, getUserLanguage} from "../../../../utils/languageManagement.js";
import { sendRequest } from "../../../../utils/sendRequest.js";

class JoinComponent extends HTMLElement {

	constructor() {
		super();

		this.temporaryBuildObject = {
			first: {name: 'Call of duty league major final', score: '15/16'},
			second: {name: 'League of Legends Worlds', score: '11/16'},
			third: {name: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', score: '4/8'},
			fourth: {name: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', score: '15/16'},
			fifth: {name: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', score: '11/16'},
			sixth: {name: 'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW', score: '11/16'},
		}

		this.innerHTML = `
			<div class="join-component-content">
				<h4>${getString('buttonComponent/join')}</h4>
				<div class="tournaments-list">
					${this.getTournamentList()}
				</div>
			</div>
		`;

	}

	async connectedCallback() {
		if (await getUserLanguage() === 'fr')
			this.className = 'join-component-french';
		this.createTournamentsNameTooltip();
		this.attachEventsListener();
	}

	attachEventsListener() {
		this.querySelector('.tournaments-list').addEventListener('scroll', () => {
			this.updateTournamentNameTooltipPosition();
		});

		document.addEventListener('game-extended', () => {
			this.updateTournamentNameTooltipPosition();
		});

		document.addEventListener('game-reduced', () => {
			this.updateTournamentNameTooltipPosition();
		});
	}

	async getTournamentList() {
		// const tournamentsInfos = Object.values(this.temporaryBuildObject);
		// let tournamentList = '';

		// for (const tournamentInfo of tournamentsInfos) {
		// 	tournamentList +=  `
		// 		<div class="joinable-tournament">
		// 			<div class="tournament-left-infos">
		// 				<p class="tournament-name">${tournamentInfo.name}</p>
		// 			</div>
		// 			<div class="tournament-right-infos">
		// 				<p>${tournamentInfo.score}</p>
		// 				<button-component label="${getString('buttonComponent/join')}" class="generic-btn"></button-component>
		// 			</div>
		// 		</div>
		// 	`;
		// }

		// return tournamentList;
		try {
			let res = await sendRequest('GET', `/api/tournament/get_joinable_tournaments/`, null, false);

			console.log(res);
		} catch (error) {
			
		}
	}


	createTournamentsNameTooltip() {
		const joinableTournaments = this.querySelectorAll('.joinable-tournament');

		joinableTournaments.forEach(joinableTournament => {
			const tournamentNameContainer = joinableTournament.querySelector('.tournament-left-infos');
			const tournamentName = tournamentNameContainer.querySelector('.tournament-name');

			if (tournamentName.scrollWidth > tournamentNameContainer.scrollWidth) {
				const tournamentNameTooltip = document.createElement('p');

				tournamentNameTooltip.classList.add('tournament-name-tooltip');
				tournamentNameTooltip.innerText = `${tournamentName.innerText}`;
				tournamentNameContainer.appendChild(tournamentNameTooltip);
				tournamentNameTooltip.style.top = `${tournamentName.offsetTop + tournamentName.offsetHeight}px`;
			}
		});
	}

	updateTournamentNameTooltipPosition() {
		const tournamentsList = this.querySelector('.tournaments-list');
		const tournamentsNameContainer = tournamentsList.querySelectorAll('.tournament-left-infos');

		tournamentsNameContainer.forEach((tournamentNameContainer) => {
			const tournamentName = tournamentNameContainer.querySelector('.tournament-name');
			const tournamentNameTooltip = tournamentNameContainer.querySelector('.tournament-name-tooltip');

			if (tournamentNameTooltip) {
				tournamentNameTooltip.style.top = `${tournamentName.offsetTop + tournamentName.offsetHeight - tournamentsList.scrollTop}px`;
			}
		});
	}

}

customElements.define('join-component', JoinComponent);
