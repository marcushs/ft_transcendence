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
		this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawFrame();
		this.movePlayers();
		requestAnimationFrame(() => this.gameLoop());
	}


	drawFrame(gameInfos) {
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw('rgb(255, 22, 198)', 'rgb(146, 0, 117)');
	}


	movePlayers() {
		this.movePlayerOne();
		this.movePlayerTwo();
	}


	movePlayerOne() {
		let newPosY = 0;

		if (this.keysPlayerOne.up)
			newPosY = -2;
		if (this.keysPlayerOne.down)
			newPosY = 2;
		if (this.checkHitBox(newPosY, this.playerOne))
			return ;
		this.movePlayerDelay(newPosY, this.playerOne, () => this.playerOne.y += newPosY);
	}


	movePlayerTwo() {
		let newPosY = 0;

		if (this.keysPlayerTwo.up)
			newPosY = -2;
		if (this.keysPlayerTwo.down)
			newPosY = 2;
		if (this.checkHitBox(newPosY, this.playerTwo))
			return ;
		this.movePlayerDelay(newPosY, this.playerTwo, () => this.playerTwo.y += newPosY);
	}


	checkHitBox(newPosY, player) {
		console.log(player.y - newPosY - player.height / 2, player.y + newPosY + player.height / 2)
		if (player.y + newPosY + player.height / 2 + 5 > this.canvas.height)
			return true;
		if (player.y + newPosY - player.height / 2 - 5 < 0)
			return true;
		return false;
	}


	movePlayerDelay(newPosY, player, callback) {
		let i = 0;

		const intervalId = setInterval(() => {
			if (this.checkHitBox(newPosY, player)) {
				clearInterval(intervalId);
				return ;
			}
			callback();
			i++;
			if (i === 10)
				clearInterval(intervalId);
		}, 1);
	}

}