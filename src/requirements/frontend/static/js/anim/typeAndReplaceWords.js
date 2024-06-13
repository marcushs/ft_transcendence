async function typeAndReplaceWords() {
	const words = [' users', ' tournaments'];
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

function sleep(sleepDuration) {
	return new Promise(resolve => setTimeout(resolve, sleepDuration));
}

export default typeAndReplaceWords;