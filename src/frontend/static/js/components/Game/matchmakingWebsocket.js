export let matchmakingSocket = null;

export async function matchmakingWebsocket() {
	if (matchmakingSocket && matchmakingSocket.readyState === WebSocket.OPEN) {
		console.log('already connected to matchmaking Websocket');
		return;
	}
	matchmakingSocket = new WebSocket(`ws://localhost:8006/ws/matchmaking/`);

	matchmakingSocket.onopen = () => {
		console.log('Connected to matchmaking websocket');
	}

	matchmakingSocket.onmessage = (event) => {
	}

	matchmakingSocket.onclose = async () => {
	}

    matchmakingSocket.onerror = function(event) {
        console.log("Websocket error: ", event);
    };
}