import {getString} from "./languageManagement.js";

export default function disableButtonsInGameResearch() {
	const genericButtons = document.querySelectorAll('.generic-btn');
	let playButtons = [];

	genericButtons.forEach((button) => {
		if (button.innerHTML === `${getString('buttonComponent/play')}`)
			playButtons.push(button);
	});

	console.log(genericButtons);
	playButtons.forEach((button) => {
		button.className = "generic-btn-disabled";
	});
}