import {getString} from "./languageManagement.js";

export default function disableButtonsInGameResearch() {
	const buttons = document.querySelectorAll('button-component');
	let playButtons = [];

	buttons.forEach((button) => {
		if (button.className === "generic-btn" && button.querySelector('button').innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	playButtons.forEach((button) => {
		button.className = "generic-btn-disabled";
	});
}