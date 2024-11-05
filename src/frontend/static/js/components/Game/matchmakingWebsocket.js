import getUserData from "../../utils/getUserData.js";
import { gameWebsocket } from "./states/inGame/gameWebsocket.js";

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

		if (data.type === 'game_found') {
			const matchmakingPopUp = document.querySelector('matchmaking-research-component');
			matchmakingPopUp.setFoundGameRender();
			await gameWebsocket(data.player_id);
		}
	}

	matchmakingSocket.onclose = async () => {
		console.log('matchmaking socket closed');

	}

    matchmakingSocket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}
