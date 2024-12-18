import { gameInstance, resetGameInstance } from "./inGameComponent.js";
import { GameStillActive } from "./gameNetworkManager.js";
import { startGame } from "./Game.js";
import { setTournamentAlias } from "../../../../utils/tournamentUtils/tournamentMatchUtils.js";
import { handleGameConnectionTimeOut } from "../../../../utils/game/gameConnection.js";

export let gameSocket = null;
let reconnectTimeout;


export async function gameWebsocket(userId) {
	if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
		return;
	}

	gameSocket = new WebSocket(`/ws/game/?user_id=${userId}`);

	gameSocket.onopen = () => { }

	gameSocket.onmessage = (event) => {
		const data = JSON.parse(event.data)
		const actions = {
			'game_ready_to_start': async (data) => {
				await setTournamentAlias(data.game_state);
				startGame(data.game_id, data.game_state, data.map_dimension);
			},
			'data_update': (data) => {
				if (gameInstance) gameInstance.updateGameRender(data.game_state);
			},
			'emote_received': (data) => {
				if (gameInstance) throwReceivedEmoteEvent(data.message);
			},
			'game_finished': (data) => {
				if (gameInstance) gameInstance.gameFinished(data.message.is_win, data);
			},
			'game_canceled': (data) => {
				if (gameInstance) gameInstance.canceledGame(data.message);
			},
			'game_surrended': (data) => {
				// if (gameInstance) gameInstance.gameSurrended(data.message);
			},
			'player_disconnected': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message);
			},
			'player_reconnected': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message);
			},
			'game_resumed': (data) => {
				if (gameInstance) gameInstance.updateMessage(data.message);
			},
			'connections_time_out': (data) => {
				handleGameConnectionTimeOut(data.message);
			},
		}
		if (data.type in actions)
			actions[data.type](data);
	}

	gameSocket.onclose = async () => {
		if (gameInstance) {
			sendDisconnectMessage(userId);
			await websocketReconnection(userId);

		}
	}

    gameSocket.onerror = function(event) {
        console.error(event);
    };
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

function sendDisconnectMessage(userId) {
    if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
		gameSocket.send(JSON.stringify({
			'type': 'client_disconnected',
			'game_id': gameInstance ? gameInstance.gameId : null,
			'player_id': userId,
		}));	
    }
}

function sendReconnectMessage(userId, gameId) {
    if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
		gameSocket.send(JSON.stringify({
			'type': 'client_reconnected',
			'game_id': gameId,
			'player_id': userId,
		}));
    }
}

//---------------------------------------> Game Reconnect method <--------------------------------------\\

export async function websocketReconnection(userId) {
	const savedState = localStorage.getItem('inGameComponentState');
	const gameState = savedState ? JSON.parse(savedState) : null;
	try {
		await attemptReconnect(userId, gameState);
		return true;
	} catch (error) {
		console.error(error.message);
		if (gameState)
			localStorage.removeItem('inGameComponentState');
		if (gameInstance)
			resetGameInstance();
		return false;
	}
}

async function attemptReconnect(userId, gameState, count = 0, maxRetries = 12, reconnectionInterval = 5000) {
	try {
		await checkReconnectCondition(count, maxRetries, gameState);
		try {
			await gameWebsocket(userId);
			const result = await waitForOpenWebsocketConnection();
			if (result) {
				sendReconnectMessage(userId, gameState.gameId);
				clearTimeout(reconnectTimeout);
				return true;
			}
		} catch (error)  {
			console.error(error.message);
		}
		count++;
		reconnectTimeout = setTimeout(() => attemptReconnect(userId, gameState, count, maxRetries, reconnectionInterval));
	}
	catch (error) {
		if (error.message === "Max reconnect attempts reached. Please check your connection")
			surrenderHandler();
		clearTimeout(reconnectTimeout);
		throw new Error(error.message);
	}
}

async function checkReconnectCondition(count, maxRetries, gameState) {
	if (count >= maxRetries)
		throw new Error("Max reconnect attempts reached. Please check your connection")
	if (!gameState)
		throw new Error('instance not found')
	const gameStatus = await GameStillActive(gameState.gameId);
	
	if (gameStatus.status === 'error' && gameStatus.message === 'invalid_id')
		throw new Error('invalid game id')
	if (gameStatus.status === 'error' && gameStatus.message === 'not_found')
		throw new Error('the game you are trying to join is over')
	if (gameStatus.status === 'success' && gameStatus.user_in === false)
		throw new Error('you are not a player in this game')
}

export function waitForOpenWebsocketConnection(maxChecks = 20, interval = 500) {
	return new Promise((resolve, reject) => {
		let checkCount = 0;
		const waitOpenConnection = setInterval(() => {
			if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
				clearInterval(waitOpenConnection);
				resolve(true);
			}  else if (checkCount >= maxChecks) {
				if (gameSocket && gameSocket.readyState !== WebSocket.CLOSED)
                    disconnectGameWebSocket();
                clearInterval(waitOpenConnection);
				reject(false);
            }
		}, interval)
	})
}

//---------------------------------------> Utils export method <--------------------------------------\\

export function disconnectGameWebSocket(userId, sendMessage) {
	if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
		if (sendMessage) {
			sendDisconnectMessage(userId);
		}
		gameSocket.onclose = () => {};
		gameSocket.close();
	}
}


function throwReceivedEmoteEvent(emoteType) {
	const event = new CustomEvent('receivedEmoteEvent', {
		bubbles: true,
		detail: {
			emoteType: emoteType
		}
	});

	document.dispatchEvent(event);
}
