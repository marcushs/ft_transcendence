import { gameWebsocket } from "../../components/Game/states/inGame/gameWebsocket.js";
import '../../components/Matchmaking/MatchmakingResearchComponent.js';
import {startGame} from "../../components/Game/states/inGame/Game.js";
import {sendRequest} from "../sendRequest.js";
import getUserId from "../getUserId.js";
import {throwRedirectionEvent} from "../throwRedirectionEvent.js";

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

		console.log("received socket = ", event.data);

		const data = JSON.parse(event.data);
		if (data.type === 'already_in_game') {
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
			if (location.pathname !== '/') {
				throwRedirectionEvent('/');
				document.addEventListener('gameComponentLoaded', () => {
					throwChangeGameStateEvent();
				});
			} else {
				throwChangeGameStateEvent();
			}
			throwPlayerJoinedMatchEvent();
		}
		if (data.type === 'player_refused_private_match') {
			console.log('player_refused_private_match reached');
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		}
		if (data.type === 'private_match_canceled') {
			console.log('private_match_canceled reached');
			localStorage.removeItem("isReadyToPlay");
			localStorage.removeItem("isSearchingPrivateMatch");
			throwPrivateMatchCanceled();
			if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN)
				matchmakingSocket.close();
		}
		if (data.type === 'private_match_started') {
			console.log('private_match_started: data.player_id: ', data.player_id);
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

function throwChangeGameStateEvent() {
	const event = new CustomEvent('changeGameStateEvent', {
		bubbles: true,
		detail: {
			context: "onlineHome",
		}
	});

	document.dispatchEvent(event);
}

function throwPrivateMatchCanceled() {
	const event = new CustomEvent('privateMatchCanceled', {
		bubbles: true,
	});

	document.dispatchEvent(event);
}

function throwPlayerJoinedMatchEvent() {
	const event = new CustomEvent('playerJoinedMatchEvent', {
		bubbles: true,
	});

	document.dispatchEvent(event);
}