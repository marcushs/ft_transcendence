import { throwMatchmakingResearchEvent } from '../throwEvent/throwMatchmakingResearchEvent.js';
import { gameWebsocket } from '../../components/Game/states/inGame/gameWebsocket.js';
import { matchmakingSocket, matchmakingWebsocket } from './matchmakingWebsocket.js';
import '../../components/Matchmaking/MatchmakingResearchComponent.js'
import checkAuthentication from '../checkAuthentication.js';
import { sendRequest } from "../sendRequest.js";
import getUserId from '../getUserId.js';


export async function sendMatchSearchRequest(match_type) {
    try {
        await matchmakingWebsocket();	
        const requestResponse = await requestMatchmakingResearch({type: match_type})
        if (requestResponse.status === 'error')
            return false;
        localStorage.setItem('isSearchingGame', JSON.stringify({
            type: 'ranked',
            status: 'searching'
        }));
        const researchComponent = document.createElement('matchmaking-research-component');
        app.appendChild(researchComponent);
        console.log(requestResponse.message);
        return true;
    } catch (error) {
        if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
            matchmakingSocket.close();
        console.error(error);
        return false;
    }
}

async function requestMatchmakingResearch(payload) {
    try {
        const response = await sendRequest('POST', '/api/matchmaking/matchmaking/', payload); 
        return response;
    } catch (error) {
        throw error;
    }
}

export async function checkMatchmakingSearch() {
    const isConnected = await checkAuthentication();
    const isSearching = JSON.parse(localStorage.getItem('isSearchingGame'));

    if (!isConnected || !isSearching)
        return;
    console.log('isSearching: ', isSearching);
    try {
        const researchData = await sendRequest('GET', '/api/matchmaking/is_waiting/', null)
        console.log('test waiting: researchData: ', researchData);
        if (await isWaitingMatch(researchData))
            return;
        console.log('test connecting');
        if (await isConnectingGame())
            return;
        console.log('test end');
        closeMatchmakingResearch();
    } catch (error) {
        console.error('error with matchmaking check: ', error.message);
    }
}

async function isWaitingMatch(researchData) {
    if (researchData.waiting) {
        const userId = await getUserId();
        await matchmakingWebsocket(userId);
        if (checkPath()) {
            throwMatchmakingResearchEvent();
        } else {
            if (document.querySelector('matchmaking-research-component'))
                document.removeChild('matchmaking-research-component'); 
        }
        return true;
    }
    return false;
}

async function isConnectingGame() {
    const inGameData = await sendRequest('GET', '/api/matchmaking/user_is_in_game/', null);
    console.log('inGameData: ', inGameData);
    if (inGameData.is_in_game) {
        await gameWebsocket(inGameData.id);
        if (checkPath()) {
            throwMatchmakingResearchEvent();
            const researchComponent = document.querySelector('matchmaking-research-component');
            researchComponent.setFoundGameRender();
        } else {
            if (document.querySelector('matchmaking-research-component'))
                document.removeChild('matchmaking-research-component'); 
        }
        return true;
    }
    return false;
}

function closeMatchmakingResearch() {
    if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
        matchmakingSocket.close()
    if (document.querySelector('matchmaking-research-component'))
        document.removeChild('matchmaking-research-component'); 
    localStorage.removeItem('isSearchingGame');
}

function checkPath() {
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/profile') && !window.location.pathname.startsWith('/users/'))
        return false;
    return true;
}