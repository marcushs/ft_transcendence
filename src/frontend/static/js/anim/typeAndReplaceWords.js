import sleep from "../utils/sleep.js";
import {getString} from "../utils/languageManagement.js";

async function typeAndReplaceWords() {
	const words = [getString('searchBarComponent/users'), getString('searchBarComponent/tournaments')];
	const searchBarInput = document.querySelector('#searchBarInput');

	while (true) {
		for (const word of words) {
			await typeLetters(word, searchBarInput);
			await sleep(3000);
			await removeLetters(word, searchBarInput);
		}
	}
}

async function typeLetters(word, searchBarInput) {
	for (let i = 0; i < word.length; i++) {
		await sleep(75);
		searchBarInput.placeholder += word[i];
	}
}

async function removeLetters(word, searchBarInput) {
	for (let i = word.length; i > 0; i--) {
		await sleep(75);
		searchBarInput.placeholder = searchBarInput.placeholder.slice(0, -1);
	}
}

export default typeAndReplaceWords;