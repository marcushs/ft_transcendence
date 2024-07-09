export function isContainWhitespace(str) {
	return /\s/.test(str);
}

export function isAlphanumeric(str) {
	return /^[a-zA-Z0-9]+$/.test(str);
}