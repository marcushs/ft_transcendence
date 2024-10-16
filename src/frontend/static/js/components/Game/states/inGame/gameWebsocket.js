import { sendRequest } from "../../../../utils/sendRequest.js";
import { gameInstance, resetGameInstance } from "./inGameComponent.js";
import { surrenderHandler } from "./gameNetworkManager.js";
import { startGame } from "./Game.js";

export let socket = null;
let reconnectTimeout;


export async function gameWebsocket(userId) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		console.log('already connected to game Websocket');
		return;
	}

	socket = new WebSocket(`ws://localhost:8005/ws/game/?user_id=${userId}`);

	socket.onopen = () => {
		console.log('Connected to game websocket');
	}

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data)
		const actions = {
			'game_ready_to_start': (data) => {
				startGame(data.game_id, data.game_state, data.map_dimension)
			},
			'data_update': (data) => {
				if (gameInstance) gameInstance.updateGameRender(data.game_state) 
			},
			'game_finished': (data) => {
				console.log('finished game received : ', data);
				if (gameInstance) gameInstance.gameFinished(data.message) 
			},
			'game_canceled': (data) => {
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
		if (gameInstance) {
			sendDisconnectMessage(userId);
			await websocketReconnection(userId);

		}
	}

    socket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

function sendDisconnectMessage(userId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({
			'type': 'client_disconnected',
			'game_id': gameInstance.gameId,
			'player_id': userId,
		}));	
    }
}

function sendReconnectMessage(userId, gameId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({
			'type': 'client_reconnected',
			'game_id': gameId,
			'player_id': userId,
		}));
    }
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

export async function websocketReconnection(userId) {
	let count = 0;
	const maxRetries = 12;
	const reconnectionInterval = 5000;

	const isReconnected = await attemptReconnect(count, maxRetries, reconnectionInterval, userId);
	return isReconnected;
}

async function attemptReconnect(count, maxRetries, reconnectionInterval, userId) {
	const savedState = localStorage.getItem('inGameComponentState');
	const gameState = savedState ? JSON.parse(savedState) : null;
	if (count >= maxRetries) {
		clearTimeout(reconnectTimeout);
		console.error('Max reconnect attempts reached. Please check your connection');
		surrenderHandler();
		localStorage.removeItem('inGameComponentState');
		resetGameInstance();
		return false;
	}
	if (!gameState) {
		clearTimeout(reconnectTimeout);
		console.log('Cant reconnect to the game, instance not found');
		return false;
	}	
	const gameStatus = await GameStillActive(gameState.gameId);
	if (gameStatus === 'active') {
		console.log(`Attempt[${count}]: reconnecting to the game's websocket...`);
		try {
			await gameWebsocket(userId);
			const result = await waitForOpenWebsocketConnection();
			if (result) {
				console.log('Reconnected to the game!');
				sendReconnectMessage(userId, gameState.gameId);
				clearTimeout(reconnectTimeout);
				return true;
			} else {
				if (count !== maxRetries)
					console.log('reconnection failed, retry...');
			}
		} catch (error)  {
			console.error("Reconnection attempt failed with error:", error);
		}
	} else if (gameStatus === 'game not found') {
		console.log('the game you are trying to join is over');
		localStorage.removeItem('inGameComponentState');
		resetGameInstance();
		return false;
	} else {
		console.log(gameStatus);
		return false;
	}
	count++;
	reconnectTimeout = setTimeout(() => attemptReconnect(count, maxRetries, reconnectionInterval, userId), reconnectionInterval);
}

export function waitForOpenWebsocketConnection(maxChecks = 20, interval = 500) {
	return new Promise((resolve, reject) => {
		let checkCount = 0;
		const waitOpenConnection = setInterval(() => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				clearInterval(waitOpenConnection);
				resolve(true);
			}  else if (checkCount >= maxChecks) {
				if (socket && socket.readyState !== WebSocket.CLOSED)
                    disconnectWebSocket();
                clearInterval(waitOpenConnection);
				reject(false);
            }
		}, interval)
	})
}

async function GameStillActive(game_id) {
	try {
		const dataResponse = await sendRequest('GET', `http://localhost:8005/game/game_is_active/?q=${game_id}`, null)
		if (dataResponse.status === 'error')
			return String(dataResponse.message);
		return 'active';
	} catch (error) {
		return `fetch error: ${String(error)}`
	}
}

 //---------------------------------------> Utils export method <--------------------------------------\\

export function disconnectWebSocket(userId, sendMessage) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		if (sendMessage)
			sendDisconnectMessage(userId);
		socket.onclose = () => {};
		socket.close();
		console.log('Game connection closed');
	}
}