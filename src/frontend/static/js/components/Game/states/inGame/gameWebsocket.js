import { startGame } from "./Game.js";
import { gameInstance } from "./inGameComponent.js";
import { sendRequest } from "../../../../utils/sendRequest.js";

export let socket = null;
let gameInProgress = false;
let isConnected = false;

export async function gameWebsocket(userId) {

	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('already connected to game Websocket');
		return;
	}

	socket = new WebSocket(`ws://localhost:8005/ws/game/?user_id=${userId}`);

	socket.onopen = () => {
		console.log('Connected to game websocket');
		isConnected = true
	}

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data)
		const actions = {
			'game_ready_to_start': (data) => {
				gameInProgress = true;
				startGame(data.game_id, data.game_state, data.map_dimension)
			},
			'data_update': (data) => {
				if (gameInstance) gameInstance.updateGameRender(data.game_state) 
			},
			'game_finished': (data) => {
				gameInProgress = false
				if (gameInstance) gameInstance.gameFinished(data.message) 
			},
			'game_canceled': (data) => {
				gameInProgress = false
				if (gameInstance) gameInstance.canceledGame(data.message) 
			},
			'player_disconnected': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message) 
			},
			'player_reconnected': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message) 
			},
			'game_resumed': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message) 
			},
			'error_log': (data) => console.log(data.message)
			
		}
		if (data.type in actions)
			actions[data.type](data);
	}

	socket.onclose = async () => {
		isConnected = false
		sendDisconnectMessage(userId);
		if (gameInProgress)
			await websocketReconnection(userId);
	}

    socket.onerror = function(event) {
		isConnected = false
        console.log("Websocket error: ", event);
    };
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

function sendDisconnectMessage(userId) {
    if (socket) {
        const payload = {
            type: 'client_disconnected',
            user_id: userId,
        };
        socket.send(JSON.stringify(payload));
    }
}

function sendReconnectMessage(userId) {
    if (socket) {
        const payload = {
            type: 'client_reconnected',
            user_id: userId,
        };
        socket.send(JSON.stringify(payload));
    }
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

async function websocketReconnection(userId) {
	let count = 0;
	const maxRetries = 12;
	const reconnectionInterval = 5000;

	await attemptReconnect(count, maxRetries, reconnectionInterval, userId);
}

async function attemptReconnect(count, maxRetries, reconnectionInterval, userId) {
	if (count >= maxRetries) {
		console.error('Max reconnect attempts reached. Please check your connection');
		return;
	}
	if (!gameInstance) {
		console.log('Cant reconnect to the game, instance not found');
		return;
	}
	const isGameActive = await GameStillActive(gameInstance.game_id);
	if (isGameActive !== 'active') {
		console.log(`Error: ${isGameActive}`);
		return;
	}
	console.log('Attempting to reconnect to game websocket...');
	await gameWebsocket(userId);
	if (isConnected) {
		console.log('Reconnected to the game!');
		sendReconnectMessage(userId);
		return;
	}
	count++;
	setTimeout(() => attemptReconnect(count, maxRetries, reconnectionInterval, userId), reconnectionInterval);
}

async function GameStillActive(game_id) {
	if (!Number.isInteger(game_id)) {
		return 'Invalid game_id provided';
	}
	try {
		const dataResponse = await sendRequest('GET', `http://localhost:8005/game/game_is_active/?q=${game_id}`)
		if (dataResponse.status === 'error')
			return String(data.message);
		return 'active';
	} catch (error) {
		return `fetch error: ${String(error)}`
	}
}

 //---------------------------------------> Utils export method <--------------------------------------\\

export function disconnectWebSocket() {
	if (socket) {
		gameInProgress = false;
		socket.onclose = () => {};
		socket.close();
	}
	console.log('WebSocket connection closed');
}