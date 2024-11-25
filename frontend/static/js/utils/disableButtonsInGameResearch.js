import {getString} from "./languageManagement.js";

export default function disableButtonsInGameResearch() {
	const buttons = document.querySelectorAll('button-component');
	const invitePlayerElement = document.querySelectorAll('.contact-action-invite-play');
	const playInvitationButtonDisabled = document.querySelectorAll('.play-invitation-button');

	let playButtons = [];

	buttons.forEach((button) => {
		console.log(button)
		if (button.className === "generic-btn" && button.querySelector('button').innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	playButtons.forEach((button) => {
		button.className = "generic-btn-disabled";
	});

	invitePlayerElement.forEach(player => {
		player.classList.add('contact-action-disabled');
	});

	console.log('test = ', playInvitationButtonDisabled)
	playInvitationButtonDisabled.forEach(button => {
		button.className = "play-invitation-button-disabled";
	});
}