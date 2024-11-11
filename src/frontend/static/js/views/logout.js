import "../components/NavBarComponent.js";
import { throwRedirectionEvent } from "../utils/throwRedirectionEvent.js"
import rotatingGradient from "../anim/rotatingGradient.js";
import "../components/ButtonComponent.js";
import {sendRequest} from "../utils/sendRequest.js";
import { contactSocket, chatSocket } from "./websocket/loadWebSocket.js";
import { notificationSocket } from "./websocket/loadWebSocket.js";
import { gameSocket } from "../components/Game/states/inGame/gameWebsocket.js";
import { matchmakingSocket } from "../utils/matchmaking/matchmakingWebsocket.js";
import { disconnectGameWebSocket } from "../components/Game/states/inGame/gameWebsocket.js";
import {getString} from "../utils/languageManagement.js";

export default () => {
	const html = `
		<section class="logout-page">
			<div class="logout-container-background"></div>
			<div class="logout-container">
				<div class="logout-content">
					<h1>${getString("logoutSentence")}</h1>
					<div class="buttons-container">
						<button-component label="Yes" class="generic-btn"></button-component>
						<button-component label="Cancel" class="generic-btn-disabled"></button-component>
					</div>
				</div>
			</div>
		</section>`;

	setTimeout(() => {
		rotatingGradient('.logout-container-background', '#FF16C6', '#00D0FF');
		rotatingGradient('.logout-container', '#FF16C6', '#00D0FF');
		rotatingGradient('.logout-content', '#1c0015', '#001519');
		attachEvent();
	}, 0);

	return html;
}

function attachEvent() {
    const yesBtn = document.querySelector('button-component[label="Yes"]');
    const cancelBtn = document.querySelector('button-component[label="Cancel"]');

	cancelBtn.addEventListener('click', () => {
            throwRedirectionEvent(`${localStorage.getItem('lastAuthorizedPage')}`);
	    });

    yesBtn.addEventListener('click', async () => {
        try {

            const data = await sendRequest('POST', '/api/auth/logout/', null);
			closeAllWebsocket();
            throwRedirectionEvent('/');
        } catch (error) {
            console.log(`${error}`);
        }
    });
}

async function closeAllWebsocket() {
	if (gameSocket && gameSocket.readyState !== WebSocket.CLOSED)
		disconnectGameWebSocket();
	if (matchmakingSocket && matchmakingSocket.readyState !== WebSocket.CLOSED)
		matchmakingSocket.close();
	if (contactSocket && contactSocket.readyState !== WebSocket.CLOSED)
		contactSocket.close();
	if (notificationSocket && notificationSocket.readyState !== WebSocket.CLOSED)
		notificationSocket.close();
	if (chatSocket && chatSocket.readyState !== WebSocket.CLOSED)
		chatSocket.close();
}