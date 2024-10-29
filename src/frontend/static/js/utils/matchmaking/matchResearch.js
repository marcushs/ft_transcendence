import { throwMatchmakingResearchEvent } from '../throwEvent/throwMatchmakingResearchEvent.js';
import { gameSocket, gameWebsocket } from '../../components/Game/states/inGame/gameWebsocket.js';
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
    const isSearching = JSON.parse(localStorage.getItem('isSearchingGame'));
    const isUserConnected = await checkAuthentication();
    if (!isSearching || !isUserConnected)
        return;
    try {
        const researchData = await sendRequest('GET', '/api/matchmaking/is_waiting/', null)
        if (!researchData.waiting && isSearching.status !== 'joining') {
            if (document.querySelector('matchmaking-research-component'))
                document.removeChild('matchmaking-research-component'); 
            localStorage.removeItem('isSearchingGame');
        }
        if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/profile') && !window.location.pathname.startsWith('/users/')) {
            if (document.querySelector('matchmaking-research-component'))
                document.removeChild('matchmaking-research-component');
            return;
        }
        if (isSearching.status === 'joining' && !gameSocket) {
            const userId = await getUserId();
            if (userId)
                await gameWebsocket(userId);
            return; 
        }
        if (!matchmakingSocket || matchmakingSocket.readyState !== WebSocket.OPEN) 
            await matchmakingWebsocket();
        throwMatchmakingResearchEvent();
    } catch (error) {
        console.error('error with matchmaking check: ', error.message);
    }
}