class GameTestComponent extends HTMLElement {
	constructor() {
		super();

		this.canvasElement = null;
		this.parentHeight = null;
		this.parentWidth = null;
		this.initialPosY = null;
		this.initializeComponent();
	}


	initializeComponent() {
		const parent = document.querySelector('.states-container');

		this.innerHTML = `
			<canvas width="${parent.clientWidth}" height="${parent.clientHeight}"></canvas>
		`;
	}


	connectedCallback() {
		const parent = document.querySelector('.states-container');
		this.canvasElement = this.querySelector('canvas');
		this.canvasContext = this.canvasElement.getContext('2d');
		this.initialPosY = (parent.clientHeight / 2);
		this.drawInCanvas(this.initialPosY, this.initialPosY);
	}


	// refreshCanvas(coordinatesObj) {
	// 	this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// 	this.drawInCanvas(coordinatesObj.playerOnePosY, coordinatesObj.playerTwoPosY);
	// }
	//

	drawInCanvas(playerOnePosY, playerTwoPosY) {
		this.drawPlayerOne(playerOnePosY - 225 / 2);
		this.drawPlayerTwo(playerTwoPosY - 225 / 2);
	}


	drawPlayer(posX, posY, color) {
		const radius = 8;
		const width = 20;
		const height = 225;

		this.canvasContext.fillStyle = color;
		this.canvasContext.beginPath();
		this.canvasContext.lineTo(posX, posY + radius);
		this.canvasContext.arcTo(posX, posY, posX + width, posY, radius);
		this.canvasContext.arcTo(posX + width, posY, posX + width, posY + height, radius);
		this.canvasContext.arcTo(posX + width, posY + height, posX, posY + height, radius);
		this.canvasContext.arcTo(posX, posY + height, posX, posY, radius);
		this.canvasContext.closePath();
		this.canvasContext.fill();
	}


	drawPlayerOne(posY) {
		const posX = 15;
		const color = 'rgb(0, 206, 255)';

		this.drawPlayer(posX, posY, color);
	}

	drawPlayerTwo(posY) {
		const parent = document.querySelector('.states-container');
		const posX = parent.clientWidth - 35;
		const color = 'rgb(255, 22, 198)';

		this.drawPlayer(posX, posY, color);
	}
}

customElements.define('game-test-component', GameTestComponent);