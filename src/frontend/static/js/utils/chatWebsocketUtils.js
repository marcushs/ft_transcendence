export function chatWebsocket() {
	const chatUUID = window.crypto.randomUUID();

	const chatSocket = new WebSocket(
		'ws://'
		+ 'localhost:8008'
		+ '/ws/chat/'
		+ chatUUID
		+ '/'
	);

	chatSocket.onopen = function (e) {
		console.log(e)
		console.log("The connection was setup successfully !");
	  };

	chatSocket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		const newMsgElem = document.createElement('p');

		newMsgElem.innerText = data.message;
		document.querySelector('.chatroom-conversation').appendChild(newMsgElem);
		// document.querySelector('#chat-log').value += (data.message + '\n');
	};

	chatSocket.onclose = function(e) {
		console.error('Chat socket closed unexpectedly');
	};

	// document.querySelector('#chat-message-input').focus();
	// document.querySelector('#chat-message-input').onkeyup = function(e) {
	// 	if (e.keyCode === 13) {  // enter, return
	// 		document.querySelector('#chat-message-submit').click();
	// 	}
	// };

	document.querySelector('#chat-message-submit').onclick = function(e) {
		const messageInputDom = document.querySelector('#chat-message-input');
		const message = messageInputDom.value;
		chatSocket.send(JSON.stringify({
			'message': message
		}));
		messageInputDom.value = '';
	}
}

