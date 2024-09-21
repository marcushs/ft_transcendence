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

		this.tempGameInfos = {
			playerOnePosY: this.heightReference / 2,
			playerTwoPosY: this.heightReference / 3,
			ballPosY: this.heightReference / 2,
			ballPosX: this.widthReference,
			ballAngle: 120
		}
		this.animate(this.tempGameInfos);
		this.drawInCanvas(this.tempGameInfos);
		this.attachEventsListener();
	}


	attachEventsListener() {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'w') {
				let base = 0;
				const intervalId = setInterval(() => {
					this.tempGameInfos.playerOnePosY -= 2;
					base++;
					if (base === 20)
						clearInterval(intervalId);
				}, 1)
				// for (let i = 0; i < 50; i++) {
				// 	// this.refreshCanvas(this.tempGameInfos);
				// }
				this.isUp = true;
			} else if (event.key === 's') {
				let base = 0;
				const intervalId = setInterval(() => {
					this.tempGameInfos.playerOnePosY += 2;
					base++;
					// this.tempGameInfos.playerOnePosY += 50;
					if (base === 20)
						clearInterval(intervalId);
				}, 1)
				this.isDown = true;
				// this.refreshCanvas(this.tempGameInfos);
			}
		})
	}


	animate(tempGameInfos) {
		this.refreshCanvas(tempGameInfos);
		tempGameInfos.ballPosX -= 10;
		requestAnimationFrame(() => this.animate(tempGameInfos));
	}


	refreshCanvas(tempGameInfos, isUp = false, isDown = false) {
		this.canvasContext.clearRect(0, 0, this.widthReference, this.heightReference);
		this.drawInCanvas(tempGameInfos, isUp, isDown);
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

	drawInCanvas(gameInfos, isUp = false, isDown = false) {
		this.drawPlayers(gameInfos, isUp, isDown);
		this.drawBall(gameInfos);
	}

	drawPlayers(gameInfos, isUp = false, isDown = false) {
		// const playerOneColor = 'rgb(0, 206, 255)';
		// const playerTwoColor = 'rgb(255, 22, 198)';
		const blackColor = 'rgb(0, 0, 0)';

		this.playerWidth = this.widthReference * 0.005;
		this.playerHeight = this.heightReference * 0.2;
		this.playerRadius = 6;

		// Add a blur effect with the players colors
		// this.canvasContext.filter = 'blur(12px)';
		// this.drawPlayerOne(gameInfos.playerOnePosY, playerOneColor);
		// this.drawPlayerTwo(gameInfos.playerTwoPosY, playerTwoColor);

		// Add a blur effect with black color (for shadow effect)
		// this.canvasContext.filter = 'blur(9px)';
		// this.drawPlayerOne(gameInfos.playerOnePosY, blackColor);
		// this.drawPlayerTwo(gameInfos.playerTwoPosY, blackColor);

		// Draw players
		// this.canvasContext.filter = 'blur(0px)';
		// this.canvasContext.restore();
		let playerOneColor;
		let playerTwoColor;
		let opacity;

		if (this.isUp) {

			for (let i = 5; i > 0; i--) {
				opacity = 1 / i;
				console.log(opacity)
				playerOneColor = `rgba(0, 206, 255, ${opacity})`;
				playerTwoColor = `rgba(255, 22, 198, ${opacity})`;
				this.drawPlayerOne(gameInfos.playerOnePosY + i, playerOneColor);
				this.drawPlayerTwo(gameInfos.playerTwoPosY, playerTwoColor);
			}
			this.isUp = false;
		} else if (this.isDown) {
			for (let i = 5; i > 0; i--) {
				opacity = 1 / i;
				playerOneColor = `rgba(0, 206, 255, ${opacity})`;
				playerTwoColor = `rgba(255, 22, 198, ${opacity})`;
				this.drawPlayerOne(gameInfos.playerOnePosY - i, playerOneColor);
				this.drawPlayerTwo(gameInfos.playerTwoPosY, playerTwoColor);
			}
			this.isDown = false;
		}
		playerOneColor = `rgba(0, 206, 255, ${opacity})`;
		playerTwoColor = `rgba(255, 22, 198, ${opacity})`;
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

		this.drawBallTrail(posX, posY);
		// Background
		this.canvasContext.fillStyle = 'rgb(0, 0, 0)';
		this.canvasContext.beginPath();
		this.canvasContext.arc(posX, posY, ballRadius + 3, 0, 2 * Math.PI);
		this.canvasContext.closePath();
		this.canvasContext.fill();

		// Ball
		this.canvasContext.beginPath();
		this.canvasContext.fillStyle = ballColor;
		this.canvasContext.arc(posX, posY, ballRadius, 0, 2 * Math.PI);
		this.canvasContext.fill();
		this.drawBallTexture(posX, posY, ballRadius);
	}

	drawBallTexture(posX, posY, ballRadius) {
		this.angle += Math.PI / 16;
		// this.angle = 0;
		this.angleDirection = 0;
		// console.log(Math.cos(Math.PI / 6 + Math.PI + this.angle), Math.sin(Math.PI / 6 + Math.PI + this.angle))
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


	drawBallTrail(posX, posY) {

		const color = 'rgb(255, 22, 198)';
		const ballSize = this.widthReference * 0.005;
		const ballRadius = 15;

		this.canvasContext.fillStyle = color;

		const coordinatesTop = {
			x: posX - 10,
			y: posY
		}
		const coordinatesBottom = {
			x: posX - 10,
			y: posY
		}

		this.canvasContext.beginPath();
		this.canvasContext.lineTo(coordinatesTop.x, coordinatesTop.y);
		this.canvasContext.lineTo(coordinatesTop.x , coordinatesTop.y - 5);

		this.canvasContext.arcTo(coordinatesTop.x, coordinatesTop.y - 25, coordinatesTop.x + 25, coordinatesTop.y - 15, 25);
		this.canvasContext.arcTo(coordinatesTop.x + 40, coordinatesTop.y - 10, coordinatesTop.x + 60, coordinatesTop.y - 25, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 40, coordinatesTop.y - 8);
		this.canvasContext.arcTo(coordinatesTop.x + 45, coordinatesTop.y - 6, coordinatesTop.x + 60, coordinatesTop.y - 15, 25);
		this.canvasContext.arcTo(coordinatesTop.x + 42, coordinatesTop.y - 2, coordinatesTop.x + 40, coordinatesTop.y - 2, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 48, coordinatesTop.y - 6);
		this.canvasContext.arcTo(coordinatesTop.x + 48, coordinatesTop.y - 6, coordinatesTop.x + 100, coordinatesTop.y, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 100, coordinatesTop.y);
		this.canvasContext.closePath();
		this.canvasContext.fill();

		this.canvasContext.beginPath();
		this.canvasContext.lineTo(coordinatesBottom.x , coordinatesBottom.y);
		this.canvasContext.lineTo(coordinatesBottom.x , coordinatesBottom.y + 5);

		this.canvasContext.arcTo(coordinatesBottom.x, coordinatesBottom.y + 25, coordinatesBottom.x + 25, coordinatesBottom.y + 15, 25);
		this.canvasContext.arcTo(coordinatesBottom.x + 40, coordinatesBottom.y + 10, coordinatesBottom.x + 60, coordinatesBottom.y + 25, 25);
		this.canvasContext.lineTo(coordinatesBottom.x + 40, coordinatesBottom.y + 8);
		this.canvasContext.arcTo(coordinatesBottom.x + 45, coordinatesBottom.y + 6, coordinatesBottom.x + 60, coordinatesBottom.y + 15, 25);
		this.canvasContext.arcTo(coordinatesBottom.x + 42, coordinatesBottom.y + 2, coordinatesBottom.x + 40, coordinatesBottom.y + 2, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 48, coordinatesTop.y + 6);
		this.canvasContext.arcTo(coordinatesBottom.x + 48, coordinatesBottom.y + 6, coordinatesBottom.x + 100, coordinatesBottom.y, 25);
		this.canvasContext.lineTo(coordinatesBottom.x + 100, coordinatesBottom.y);
		this.canvasContext.closePath();
		this.canvasContext.fill();


		// this.canvasContext.fillStyle = 'rgb(3, 114, 155)';
		this.canvasContext.fillStyle = 'rgb(146, 0, 117)';

		this.canvasContext.beginPath();
		this.canvasContext.lineTo(coordinatesTop.x , coordinatesTop.y);
		this.canvasContext.lineTo(coordinatesTop.x , coordinatesTop.y - 4);

		this.canvasContext.arcTo(coordinatesTop.x, coordinatesTop.y - 23, coordinatesTop.x + 22, coordinatesTop.y - 13.5, 25);
		this.canvasContext.arcTo(coordinatesTop.x + 38, coordinatesTop.y - 8, coordinatesTop.x + 58, coordinatesTop.y - 23, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 38, coordinatesTop.y - 6);
		this.canvasContext.arcTo(coordinatesTop.x + 43, coordinatesTop.y - 4, coordinatesTop.x + 58, coordinatesTop.y - 13, 25);
		this.canvasContext.arcTo(coordinatesTop.x + 40, coordinatesTop.y, coordinatesTop.x + 38, coordinatesTop.y, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 46, coordinatesTop.y - 4);
		this.canvasContext.arcTo(coordinatesTop.x + 46, coordinatesTop.y - 4, coordinatesTop.x + 98, coordinatesTop.y, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 98, coordinatesTop.y);
		this.canvasContext.closePath();
		this.canvasContext.fill();

		this.canvasContext.beginPath();
		this.canvasContext.lineTo(coordinatesBottom.x , coordinatesBottom.y);
		this.canvasContext.lineTo(coordinatesBottom.x , coordinatesBottom.y + 4);

		this.canvasContext.arcTo(coordinatesBottom.x, coordinatesBottom.y + 23, coordinatesBottom.x + 22, coordinatesBottom.y + 13.5, 25);
		this.canvasContext.arcTo(coordinatesBottom.x + 38, coordinatesBottom.y + 8, coordinatesBottom.x + 58, coordinatesBottom.y + 23, 25);
		this.canvasContext.lineTo(coordinatesBottom.x + 38, coordinatesBottom.y + 6);
		this.canvasContext.arcTo(coordinatesBottom.x + 43, coordinatesBottom.y + 4, coordinatesBottom.x + 58, coordinatesBottom.y + 13, 25);
		this.canvasContext.arcTo(coordinatesBottom.x + 40, coordinatesBottom.y, coordinatesBottom.x + 38, coordinatesBottom.y, 25);
		this.canvasContext.lineTo(coordinatesTop.x + 46, coordinatesTop.y + 4);
		this.canvasContext.arcTo(coordinatesBottom.x + 46, coordinatesBottom.y + 4, coordinatesBottom.x + 98, coordinatesBottom.y, 25);
		this.canvasContext.lineTo(coordinatesBottom.x + 98, coordinatesBottom.y);
		this.canvasContext.closePath();
		this.canvasContext.fill();
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