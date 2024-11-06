import {getString} from "./languageManagement.js";

export default function resetButtonsOnMatchmakingCanceled() {
	const buttons = document.querySelectorAll('button-component');
	let playButtons = [];

	buttons.forEach((button) => {
		if (button.className === "generic-btn-disabled" && button.querySelector('button').innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	playButtons.forEach((button) => {
		button.className = "generic-btn";
	});
}