export default () => {
	const html = `
		<h1>This is a chat component</h1>
		<textarea id="chat-log" cols="100" rows="20"></textarea><br>
		<input id="chat-message-input" type="text" style="background-color: white;" placeholder="Message..."><br>
		<input id="chat-message-submit" type="button" value="Send">
	`;

	setTimeout(() => {
		const chatSocket = new WebSocket(
            'ws://localhost:8006/ws/chat/'
        );

		chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            document.querySelector('#chat-log').value += (data.message + '\n');
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly');
        };

        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            chatSocket.send(JSON.stringify({
                'message': message
            }));
            messageInputDom.value = '';
		}
	}, 0);

	return html;
}
