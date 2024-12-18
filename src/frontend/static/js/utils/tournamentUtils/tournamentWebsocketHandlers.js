import { getString } from '../languageManagement.js';
import { putNewTournamentToDOM, redirectToTournamentWaitingRoom, updateTournamentInfo, redirectToTournamentHome, redirectToWinnerPage } from './joinTournamentUtils.js';
import { redirectToTournamentLostMatch, redirectToTournamentMatch, startTournamentMatchInstance } from './tournamentMatchUtils.js';

export async function handleCreateTournament(data) {
    if (data.status === 'success') {
        const tournamentData = {
            state: 'waitingRoom',
            tournamentData: data.tournament,
            matchData: null
        }

        localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
        redirectToTournamentWaitingRoom(data.tournament);
    } else {
        handleError(data.message);
    }
}

export function handleNewTournament(data) {
    putNewTournamentToDOM(data.tournament);
}

export async function handleJoinTournament(data) {
    if (data.status === 'error') {
        handleError(data.message);
    } else {
        updateTournamentInfo(data.tournament);
    }
}

export function handleRedirectToWaitingRoom(data) {
    const tournamentData = {
        state: 'waitingRoom',
        tournamentData: data.tournament,
        matchData: null
    }

    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    redirectToTournamentWaitingRoom(data.tournament);
}

export function handleLoadMatch(data) {
    const tournamentDataObj = JSON.parse(localStorage.getItem("tournamentData"));

    const tournamentData = {
        state: 'matchState',
        tournamentData: tournamentDataObj.tournamentData,
        matchData: data.match
    }

    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    if (data.fromMatch) {
        setTimeout(() => {
            redirectToTournamentMatch(data.match);
        }, 7000);
        return;
    }
    redirectToTournamentMatch(data.match)
}

export function handleRedirectToTournamentLost(data) {
    const tournamentDataObj = JSON.parse(localStorage.getItem("tournamentData"));

    const tournamentData = {
        state: 'tournamentLost',
        tournamentData: tournamentDataObj.tournamentData,
        matchData: data.match
    }
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    const gameComponent = document.querySelector('in-game-component');
    if (gameComponent) {
        setTimeout(() => {
            redirectToTournamentLostMatch(data.match);
        }, 7000);
    } else
        redirectToTournamentLostMatch(data.match);
    }

export function handleRedirectToTournamentHome() {
    localStorage.removeItem('tournamentData');
    redirectToTournamentHome();
}

export function handleLeaveTournament(data) {    
    updateTournamentInfo(data.tournament);
}

export function handleCountdownUpdate(data) {
    const tournamentMatch = document.querySelector('tournament-match');
    if (tournamentMatch) return tournamentMatch.updateCountdownSeconds(data.time);

    const tournamentWon = document.querySelector('tournament-won');
    if (tournamentWon) return tournamentWon.updateCountdownSeconds(data.time);

    const tournamentLost = document.querySelector('tournament-lost');
    if (tournamentLost) return tournamentLost.updateCountdownSeconds(data.time);
}

export async function handleStartGameInstance(data) {
    await startTournamentMatchInstance(data.payload);
}

export function handleError(message) {
    const feedback = document.querySelector('.tournament-feedback');

    if (!feedback) return ;
    feedback.innerText = '';
    feedback.innerText = getString(`tournament/${message}`);
    setTimeout(() => {
        feedback.innerText = '';
    }, 1500);
}

export function handleRedirectToWinnerPage(data) {
    const tournamentData = {
        state: 'tournamentWon',
        tournamentData: data.tournament_bracket,
        matchData: null
    }
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
    const gameComponent = document.querySelector('in-game-component');
    if (gameComponent) {
        setTimeout(() => {
            redirectToWinnerPage(data.tournament_bracket);
        }, 7000);
    } else
        redirectToWinnerPage(data.tournament_bracket);
}
