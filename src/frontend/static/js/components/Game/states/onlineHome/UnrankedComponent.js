class UnrankedComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="unranked-component-content">
				<h4>Unranked</h4>
				<button-component label="Play" class="generic-btn"></button-component>
			</div>
		`;

		this.attachEventsListener();
	}

	attachEventsListener() {
		this.querySelector('button-component').addEventListener('click', () => {
			this.handlePlayButtonClick();
		})
	}

	handlePlayButtonClick() {
		// Do something
	}

}

customElements.define('unranked-component', UnrankedComponent);