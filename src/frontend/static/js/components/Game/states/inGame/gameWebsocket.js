import { startGame } from "./Game.js";
import { gameInstance } from "./inGameComponent.js";

export let socket = null;

export async function gameWebsocket(userId) {
	if (socket !== null) {
		socket.close();
	}

	socket = new WebSocket(`ws://localhost:8005/ws/game/?user_id=${userId}`);

	socket.onopen = () => {
		console.log('Connected to game websocket');
	}

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data)
		if (data.type === 'game_ready_to_start')
				startGame(data.game_id, data.game_state, data.map_dimension);
		if (data.type === 'data_update')
			if (gameInstance)
				gameInstance.updateGameRender(data.game_state);
		if (data.type === 'game_finished')
			if (gameInstance)
				gameInstance.gameFinished(data.winner)
	}

	socket.onclose = () => {
		console.log('Disconnected from game websocket');
	}
}