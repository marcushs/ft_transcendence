import {getString} from "./languageManagement.js";

export default function resetButtonsOnMatchmakingCanceled() {
	const buttons = document.querySelectorAll('button-component');
	const invitePlayerElement = document.querySelectorAll('.contact-action-invite-play');

	let playButtons = [];

	buttons.forEach((button) => {
		if (button.className === "generic-btn-disabled" && button.querySelector('button').innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	playButtons.forEach((button) => {
		button.className = "generic-btn";
	});

	invitePlayerElement.forEach(player => {
		player.classList.remove('contact-action-disabled');
	});
}
