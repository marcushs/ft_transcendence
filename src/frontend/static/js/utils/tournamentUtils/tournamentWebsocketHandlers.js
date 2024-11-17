import { putNewTournamentToDOM, redirectToTournamentWaitingRoom, updateTournamentInfo, redirectToTournamentHome, redirectToWinnerPage } from './joinTournamentUtils.js';
import { redirectToTournamentMatch, startTournamentMatchInstance } from './tournamentMatchUtils.js';
import getUserId from "../getUserId.js";

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
    console.log('new tournament')
    putNewTournamentToDOM(data.tournament);
}

export async function handleJoinTournament(data) {
    if (data.status === 'error') {
        handleError(data.message);
    } else {
        const userId = await getUserId();
        const tournamentData = {
            state: 'waitingRoom',
            tournamentData: data.tournament,
            matchData: null
        }

        if (data.tournament.creator.id === userId) {
            updateTournamentInfo(data.tournament);
            localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
            return;
        }

        for (let member of data.tournament.members) {
            if (member.id === userId) {
                localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
                updateTournamentInfo(data.tournament);
                return;
            }
        }
    }
}

export function handleRedirectToWaitingRoom(data) {
    const tournamentData = {
        state: 'waitingRoom',
        tournamentData: data.tournament,
        matchData: null
    }

    console.log('redirect to waiting room')
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
    console.log('test load match instance')
    redirectToTournamentMatch(data.match);
}

export function handleRedirectToTournamentHome() {
    localStorage.removeItem('tournamentData');
    redirectToTournamentHome();
}

export function handleLeaveTournament(data) {
    alert("handleLeaveTournament")
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
    console.log('test start game instance')
    await startTournamentMatchInstance(data.payload);
}

export function handleError(message) {
    // implement error message in frontend
    console.log(message);
}

export function handleRedirectToWinnerPage(data) {
    redirectToWinnerPage(data.tournament_bracket);
}
