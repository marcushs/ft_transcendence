export default function sleep(sleepDuration) {
	return new Promise(resolve => setTimeout(resolve, sleepDuration));
}