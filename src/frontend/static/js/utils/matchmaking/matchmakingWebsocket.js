import { gameWebsocket } from "../../components/Game/states/inGame/gameWebsocket.js";
import '../../components/Matchmaking/MatchmakingResearchComponent.js';
import {startGame} from "../../components/Game/states/inGame/Game.js";
import {sendRequest} from "../sendRequest.js";
import getUserId from "../getUserId.js";

export let matchmakingSocket = null;

export async function matchmakingWebsocket() {
	if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN) {
		console.log('already connected to matchmaking Websocket');
		return;
	}
	matchmakingSocket = new WebSocket(`wss://localhost:3000/ws/matchmaking/`);

	matchmakingSocket.onopen = () => {
		console.log('matchmaking websocket connected');
	}

	matchmakingSocket.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		if (data.type === 'already_in_game') {
			console.log('matchmaking research canceled: user is already in game');
			const researchComponent = document.querySelector('matchmaking-research-component')
			if (researchComponent)
				researchComponent.remove();
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		}
		if (data.type === 'game_found') {
			const matchmakingPopUp = document.querySelector('matchmaking-research-component');
			if (matchmakingPopUp)
				matchmakingPopUp.setFoundGameRender();
			await gameWebsocket(data.player_id);
			matchmakingSocket.close();
		}
		if (data.type === 'player_joined_private_match') {
			throwPlayerJoinedMatchEvent();
		}
		if (data.type === 'player_refused_private_match') {
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		}
		if (data.type === 'private_match_canceled') {
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		}
		if (data.type === 'private_match_started') {
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
			await gameWebsocket(await getUserId());
		}
	}

	matchmakingSocket.onclose = async () => {
		console.log('matchmaking socket closed');
	}

    matchmakingSocket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

function throwPlayerJoinedMatchEvent() {
	const event = new CustomEvent('playerJoinedMatchEvent', {
		bubbles: true
	});

	document.dispatchEvent(event);
}