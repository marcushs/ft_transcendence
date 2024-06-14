class GameTopBarComponent extends HTMLElement {
	constructor() {
		super();

		this.innerHTML = `
			<div class="back-button">
				<img src="../../../assets/backTopBarButton.svg" alt="back top bar button">
				<p>Back</p>
			</div>
			<div class=".game-settings"></div>
		`;

		this.backButton = this.querySelector('.back-button');
		this.attachEventListener();
	}

	attachEventListener() {
		this.backButton.addEventListener('click', () => {
			const event = new CustomEvent('navigate-back', {
				bubbles: true // To navigate throughout DOM
			});

			this.dispatchEvent(event);
		});
	}

}

window.customElements.define('game-top-bar', GameTopBarComponent);