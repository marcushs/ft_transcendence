class GameTestComponent extends HTMLElement {
	constructor() {
		super();

		this.canvasElement = null;
		this.parentHeight = null;
		this.parentWidth = null;
		this.initialPosY = null;
		this.heightReference = 1000;
		this.widthReference = 1587.30;
		this.angle = 0;
		this.initializeComponent();
	}


	initializeComponent() {
		const parent = document.querySelector('.states-container');

		this.innerHTML = `
			<canvas></canvas>
		`;
	}


	connectedCallback() {
		this.initCanvas();
		this.playerSideGap = this.widthReference * 0.015;

		const tempGameInfos = {
			playerOnePosY: this.heightReference / 2,
			playerTwoPosY: this.heightReference / 3,
			ballPosY: this.heightReference / 2,
			ballPosX: this.widthReference / 2,
			ballAngle: 120
		}
		this.animate(tempGameInfos);
		this.drawInCanvas(tempGameInfos);
	}


	animate(tempGameInfos) {
		this.refreshCanvas(tempGameInfos);
		requestAnimationFrame(() => this.animate(tempGameInfos));
	}


	refreshCanvas(tempGameInfos) {
		this.canvasContext.clearRect(0, 0, this.widthReference, this.heightReference);
		this.drawInCanvas((tempGameInfos))
	}


	initCanvas() {
		const canvasElement = this.querySelector('canvas');

		this.canvasContext = canvasElement.getContext('2d');
		this.setCanvasSize(canvasElement);
		this.scaleCanvas(canvasElement);
	}


	setCanvasSize(canvasElement) {
		const devicePixelRatio = window.devicePixelRatio || 1;

		canvasElement.width = canvasElement.clientWidth * devicePixelRatio;
		canvasElement.height = canvasElement.clientHeight * devicePixelRatio;
	}


	scaleCanvas(canvasElement) {
		const scaleX = canvasElement.width / this.widthReference;
		const scaleY = canvasElement.height / this.heightReference;

		this.canvasContext.scale(scaleX, scaleY);
		this.canvasContext.save();
	}


	// refreshCanvas(coordinatesObj) {
	// 	this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// 	this.drawInCanvas(coordinatesObj.playerOnePosY, coordinatesObj.playerTwoPosY);
	// }
	//

	drawInCanvas(gameInfos) {
		this.drawPlayers(gameInfos);
		this.drawBall(gameInfos);
	}

	drawPlayers(gameInfos) {
		const playerOneColor = 'rgb(0, 206, 255)';
		const playerTwoColor = 'rgb(255, 22, 198)';
		const blackColor = 'rgb(0, 0, 0)';

		this.playerWidth = this.widthReference * 0.005;
		this.playerHeight = this.heightReference * 0.2;
		this.playerRadius = 6;

		// Add a blur effect with the players colors
		this.canvasContext.filter = 'blur(12px)';
		this.drawPlayerOne(gameInfos.playerOnePosY, playerOneColor);
		this.drawPlayerTwo(gameInfos.playerTwoPosY, playerTwoColor);

		// Add a blur effect with black color (for shadow effect)
		this.canvasContext.filter = 'blur(9px)';
		this.drawPlayerOne(gameInfos.playerOnePosY, blackColor);
		this.drawPlayerTwo(gameInfos.playerTwoPosY, blackColor);

		// Draw players
		this.canvasContext.filter = 'blur(0px)';
		this.canvasContext.restore();
		this.drawPlayerOne(gameInfos.playerOnePosY, playerOneColor);
		this.drawPlayerTwo(gameInfos.playerTwoPosY, playerTwoColor);
	}


	drawPlayerOne(posY, color) {
		const posX = this.playerSideGap;

		this.canvasContext.fillStyle = color;
		this.canvasContext.beginPath();

		this.canvasContext.lineTo(posX, posY);
		this.canvasContext.lineTo(posX - (this.playerWidth >> 1), posY);
		this.canvasContext.arcTo(posX - (this.playerWidth >> 1), posY - (this.playerHeight >> 1) - this.playerRadius, posX - (this.playerWidth >> 1) + this.playerRadius, posY - (this.playerHeight >> 1) - this.playerRadius, this.playerRadius);
		this.canvasContext.lineTo(posX + (this.playerWidth >> 1), posY - (this.playerHeight >> 1) - this.playerRadius);
		this.canvasContext.arcTo(posX + (this.playerWidth >> 1) + this.playerRadius, posY - (this.playerHeight >> 1) - this.playerRadius, posX + (this.playerWidth >> 1) + this.playerRadius, posY - (this.playerHeight >> 1), this.playerRadius);
		this.canvasContext.lineTo(posX + (this.playerWidth >> 1) + this.playerRadius, posY + (this.playerHeight >> 1));
		this.canvasContext.arcTo(posX + (this.playerWidth >> 1) + this.playerRadius, posY + (this.playerHeight >> 1) + this.playerRadius, posX + (this.playerWidth >> 1), posY + (this.playerHeight >> 1) + this.playerRadius, this.playerRadius);
		this.canvasContext.lineTo(posX + this.playerRadius, posY + (this.playerHeight >> 1) + this.playerRadius);
		this.canvasContext.arcTo(posX - (this.playerWidth >> 1), posY + (this.playerHeight >> 1) + this.playerRadius, posX - (this.playerWidth >> 1), posY + (this.playerHeight >> 1), this.playerRadius);
		this.canvasContext.lineTo(posX - (this.playerWidth >> 1), posY);

		this.canvasContext.closePath();
		this.canvasContext.fill();
	}

	drawPlayerTwo(posY, color) {
		const posX = this.widthReference - this.playerSideGap;

		this.canvasContext.fillStyle = color;
		this.canvasContext.beginPath();

		this.canvasContext.lineTo(posX, posY);
		this.canvasContext.lineTo(posX + (this.playerWidth >> 1), posY);
		this.canvasContext.arcTo(posX + (this.playerWidth >> 1), posY - (this.playerHeight >> 1) - this.playerRadius, posX + (this.playerWidth >> 1) - this.playerRadius, posY - (this.playerHeight >> 1) - this.playerRadius, this.playerRadius);
		this.canvasContext.lineTo(posX - (this.playerWidth >> 1), posY - (this.playerHeight >> 1) - this.playerRadius);
		this.canvasContext.arcTo(posX - (this.playerWidth >> 1) - this.playerRadius, posY - (this.playerHeight >> 1) - this.playerRadius, posX - (this.playerWidth >> 1) - this.playerRadius, posY - (this.playerHeight >> 1), this.playerRadius);
		this.canvasContext.lineTo(posX - (this.playerWidth >> 1) - this.playerRadius, posY + (this.playerHeight >> 1));
		this.canvasContext.arcTo(posX - (this.playerWidth >> 1) - this.playerRadius, posY + (this.playerHeight >> 1) + this.playerRadius, posX - (this.playerWidth >> 1), posY + (this.playerHeight >> 1) + this.playerRadius, this.playerRadius);
		this.canvasContext.lineTo(posX - this.playerRadius, posY + (this.playerHeight >> 1) + this.playerRadius);
		this.canvasContext.arcTo(posX + (this.playerWidth >> 1), posY + (this.playerHeight >> 1) + this.playerRadius, posX + (this.playerWidth >> 1), posY + (this.playerHeight >> 1), this.playerRadius);
		this.canvasContext.lineTo(posX + (this.playerWidth >> 1), posY);

		this.canvasContext.closePath();
		this.canvasContext.fill();
	}

	drawBall(gameInfos) {
		const ballColor = 'rgb(189, 195, 199)';
		const posY = gameInfos.ballPosY;
		const posX = gameInfos.ballPosX;
		const ballSize = this.widthReference * 0.005;
		const ballRadius = 15;

		// Background
		this.canvasContext.filter = 'blur(10px)';
		this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
		this.canvasContext.beginPath();
		this.canvasContext.arc(posX, posY, ballRadius + 3, 0, 2 * Math.PI);
		this.canvasContext.closePath();
		this.canvasContext.fill();

		// Ball
		this.canvasContext.filter = 'blur(0px)';
		this.canvasContext.beginPath();
		this.canvasContext.fillStyle = ballColor;
		this.canvasContext.arc(posX, posY, ballRadius, 0, 2 * Math.PI);
		this.canvasContext.fill();
		this.drawBallTexture(posX, posY, ballRadius);
	}

	drawBallTexture(posX, posY, ballRadius) {
		this.angle += Math.PI / 16;

		const ellipseCoordinatesX = [
			posX + Math.cos(Math.PI / 6 + Math.PI + this.angle)  * (ballRadius - 2),
			posX + Math.cos(-Math.PI / 6 + this.angle)  * (ballRadius - 2),
			posX + Math.cos(Math.PI / 2 + this.angle)  * (ballRadius - 2)
		];
		const ellipseCoordinatesY = [
			posY + Math.sin(Math.PI / 6 + Math.PI + this.angle)  * (ballRadius - 2),
			posY + Math.sin(-Math.PI / 6 + this.angle)  * (ballRadius - 2),
			posY + Math.sin(Math.PI / 2 + this.angle)  * (ballRadius - 2),
		];
		const ellipseRotation = [
			Math.PI / 5.7 + this.angle,
			-Math.PI / 5.7+ this.angle,
			-Math.PI / 2 + this.angle
		]

		for(let i = 0; i < 3; i++) {
			this.drawBallTextureLine(posX, posY, ellipseCoordinatesX[i], ellipseCoordinatesY[i], ballRadius);
			this.drawBallTextureEllipse(ellipseCoordinatesX[i], ellipseCoordinatesY[i], ellipseRotation[i]);
		}
	}

	drawBallTextureEllipse(posX, posY, ellipseRotation) {
		this.canvasContext.beginPath();
		this.canvasContext.fillStyle = 'rgb(30, 32, 43)';
		this.canvasContext.ellipse(posX, posY, 4, 7, ellipseRotation, 0, 2 * Math.PI);
		this.canvasContext.closePath();
		this.canvasContext.fill();

		this.canvasContext.beginPath();
		this.canvasContext.fillStyle = 'rgb(0, 206, 255)';
		this.canvasContext.ellipse(posX, posY, 3, 6, ellipseRotation, 0, 2 * Math.PI);
		this.canvasContext.closePath();
		this.canvasContext.fill();
	}

	drawBallTextureLine(startPosX, startPosY, endPosX, endPosY, ballRadius) {

		this.canvasContext.beginPath();
		this.canvasContext.moveTo(startPosX, startPosY);
		this.canvasContext.lineTo(endPosX, endPosY);
		this.canvasContext.strokeStyle= '#000000';
		this.canvasContext.lineWidth = 1;
		this.canvasContext.stroke();
		this.canvasContext.closePath();
		this.canvasContext.fill();
	}
}

customElements.define('game-test-component', GameTestComponent);