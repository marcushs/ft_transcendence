import Player from "./Player.js";
import Ball from "./Ball.js";

export default class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.ball = new Ball(canvas, canvas.width / 2, canvas.height / 2);
		this.playerOne = new Player(canvas, true, '2dewf-23fsdv23-32fff');
		this.playerTwo = new Player(canvas, false, '2dewf-23fsdv23-32fff');
		this.keysPlayerOne = {
			up: false,
			down: false,
		}
		this.keysPlayerTwo = {
			up: false,
			down: false,
		}
		// this.gameInfos = {
		// 	playerOnePosY: this.canvas.height / 2,
		// 	playerTwoPosY: this.canvas.height / 3,
		// 	ballPosY: this.canvas.height / 2,
		// 	ballPosX: this.canvas.width,
		// 	ballAngle: 120
		// }
		this.attachEventsListener();
		this.gameLoop();
	}


	attachEventsListener() {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'w') this.keysPlayerOne.up = true;
			if (event.key === 's') this.keysPlayerOne.down = true;
			if (event.key === 'ArrowUp') this.keysPlayerTwo.up = true;
			if (event.key === 'ArrowDown') this.keysPlayerTwo.down = true;
		});


		document.addEventListener('keyup', (event) => {
			if (event.key === 'w') this.keysPlayerOne.up = false;
			if (event.key === 's') this.keysPlayerOne.down = false;
			if (event.key === 'ArrowUp') this.keysPlayerTwo.up = false;
			if (event.key === 'ArrowDown') this.keysPlayerTwo.down = false;
		});
	}


	gameLoop() {
		console.log(this.canvas)
		this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawFrame();
		this.movePlayerPosition();
		requestAnimationFrame(() => this.gameLoop());
	}


	drawFrame(gameInfos) {
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw('rgb(255, 22, 198)', 'rgb(146, 0, 117)');
	}


	movePlayerPosition() {
		if (this.keysPlayerOne.up) this.movePlayerDelay(() => this.playerOne.y -= 2);
		if (this.keysPlayerOne.down) this.movePlayerDelay(() => this.playerOne.y += 2);
		if (this.keysPlayerTwo.up) this.movePlayerDelay(() => this.playerTwo.y -= 2);
		if (this.keysPlayerTwo.down) this.movePlayerDelay(() => this.playerTwo.y += 2);
	}


	movePlayerDelay(callback) {
		let i = 0;

		const intervalId = setInterval(() => {
			callback();
			i++;
			if (i === 10)
				clearInterval(intervalId);
		}, 1);
	}

}