import { startGame } from "./Game.js";

let socket = null;

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
		console.log('data received from game websocket : ', data);
		if (data.type === 'game_starting')
			startGame()
	}

	socket.onclose = () => {
		console.log('Disconnected from game websocket');
	}
}