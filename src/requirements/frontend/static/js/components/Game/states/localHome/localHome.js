import './LocalComponent.js'

class localHome {

	constructor() {
		this.redirectState = "local-home";
		this.class = "local-home";
	}

	render() {
		return `
			<div class="local-home-container">
				<h3>Local</h3>
				<div class="local-components-container">
					<local-component></local-component>
				</div>
			</div>
		`
	}
}


export default localHome;