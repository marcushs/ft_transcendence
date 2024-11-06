import {getString} from "./languageManagement.js";

export default function resetButtonsOnMatchmakingCanceled() {
	const genericDisabledButtons = document.querySelectorAll('.generic-btn-disabled');
	let playButtons = [];

	genericDisabledButtons.forEach((button) => {
		if (button.innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	playButtons.forEach((button) => {
		button.className = "generic-btn";
	});
}