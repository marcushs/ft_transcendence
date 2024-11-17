import { putNewTournamentToDOM, redirectToTournamentWaitingRoom, updateTournamentInfo, redirectToTournamentHome, redirectToWinnerPage } from './joinTournamentUtils.js';
import { redirectToTournamentMatch, startTournamentMatchInstance } from './tournamentMatchUtils.js';

export async function handleCreateTournament(data) {
    if (data.status === 'success') {
        redirectToTournamentWaitingRoom(data.tournament);
    } else {
        handleError(data.message);
    }
}

export function handleNewTournament(data) {
    putNewTournamentToDOM(data.tournament);
}

export function handleJoinTournament(data) {
    if (data.status === 'error') {
        handleError(data.message);
    } else {
        updateTournamentInfo(data.tournament);
    }
}

export function handleRedirectToWaitingRoom(data) {
    redirectToTournamentWaitingRoom(data.tournament);
}

export function handleLoadMatch(data) {
    console.log('loading tournament match...');
    redirectToTournamentMatch(data.match);
}

export function handleRedirectToTournamentHome() {
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
    // implement error message in frontend
    console.log(message);
}

export function handleRedirectToWinnerPage(data) {
    redirectToWinnerPage(data.tournament_bracket);
}
