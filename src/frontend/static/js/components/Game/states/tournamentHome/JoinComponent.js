import {getString, getUserLanguage} from "../../../../utils/languageManagement.js";
import { sendRequest } from "../../../../utils/sendRequest.js";
import { throwRedirectionEvent } from "../../../../utils/throwRedirectionEvent.js";
import { TournamentComponent } from "./TournamentComponent.js";

class JoinComponent extends HTMLElement {

	constructor() {
		super();

		this.innerHTML = `
			<div class="join-component-content">
				<h4>${getString('buttonComponent/join')}</h4>
				<div class="tournaments-list">
				</div>
			</div>
		`;
		this.tournamentsList;
		this.createTournamentsList();
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
		try {
			let res = await sendRequest('GET', `/api/tournament/get_joinable_tournaments/`, null, false);

			this.tournamentsList = res.tournaments_list;
		} catch (error) {
			console.error(error.message);
		}
	}

	async createTournamentsList() {
		const tournamentsListDOM = this.querySelector('.tournaments-list')

		await this.getTournamentList(); 

		this.tournamentsList.forEach(tournament => {
			const tournamentEl = new TournamentComponent(tournament);

			tournamentsListDOM.appendChild(tournamentEl);
		})
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
