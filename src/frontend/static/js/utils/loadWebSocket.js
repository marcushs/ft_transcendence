import {sendRequest} from "./sendRequest.js";

export async function loadWebSocket() {
	const socket = new WebSocket(`ws://localhost:8004/ws/notifications/`);

	  socket.onopen = function(event) {
            console.log("Connection started.");
            socket.send(JSON.stringify({'message': 'Hello, WebSocket!'}));
        };

	  socket.onmessage = function(event) {
		    const data = JSON.parse(event.data);
		    console.log("Server response: ", data);
            // socket.send(JSON.stringify({'message': 'Test send message'}));
		};

        socket.onclose = function(event) {
            console.log("Connection closed");};

        socket.onerror = function(event) {
            console.error("Websocket error: ", event);
        };
}

function handleNewMessage(event) {

}

function sendMessage() {

}