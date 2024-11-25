import './LocalComponent.js'
import {getString} from "../../../../utils/languageManagement.js";

class localHome {

	constructor() {
		this.redirectState = "local-home";
		this.class = "local-home";
	}

	render() {
		return `
			<div class="local-home-container">
				<h3>${getString("gameComponent/local")}</h3>
				<div class="local-components-container">
					<local-component></local-component>
				</div>
			</div>
		`
	}
}


export default localHome;