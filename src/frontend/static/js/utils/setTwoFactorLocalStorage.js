import {isTwoFactorActivated} from "./isTwoFactorActivated.js";
import {getTwoFactorMethod} from "./getTwoFactorMethod.js";

export async function setTwoFactorLocalStorage() {
	if (await isTwoFactorActivated()) {
		localStorage.setItem('isTwoFactorActivated', 'true');
		localStorage.setItem('twoFactorMethod', await getTwoFactorMethod());
	} else {
		localStorage.setItem('isTwoFactorActivated', 'false');
		localStorage.removeItem('twoFactorMethod');
	}
}