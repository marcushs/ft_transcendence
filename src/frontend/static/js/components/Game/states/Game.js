import Player from "./Player.js";
import Ball from "./Ball.js";

export default class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.speed = 10;
		this.ball = new Ball(canvas, canvas.width / 2, canvas.height / 2, this.speed);
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
		this.moveBall();
		requestAnimationFrame(() => this.gameLoop());
	}


	drawFrame(gameInfos) {
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw('rgb(255, 22, 198)', 'rgb(146, 0, 117)');
	}


	// --------------------------------------- Move ball -------------------------------------- //

	moveBall() {
		this.checkBallHitBox();
	}


	checkBallHitBox() {
		this.playerCollision(this.playerOne, this.speed, () => this.ball.x + this.ball.ballDirectionX - this.ball.ballRadius < this.playerOne.x + this.playerOne.width / 2, true);
		this.playerCollision(this.playerTwo, -this.speed, () => this.ball.x + this.ball.ballDirectionX + this.ball.ballRadius > this.playerTwo.x - this.playerTwo.width / 2, false);
		this.wallCollision();

		this.ball.x += this.ball.ballDirectionX;
		this.ball.y += this.ball.ballDirectionY;
	}


	playerCollision(player, speed, calculateXPosition, isPlayerOne) {
		if ((this.ball.y + this.ball.ballDirectionY + this.ball.ballRadius < player.y + player.height / 2 &&
			this.ball.y + this.ball.ballDirectionY + this.ball.ballRadius >  player.y - player.height / 2) && calculateXPosition()) {

			this.ball.ballDirectionX = speed;

			let collidePoint = this.ball.y - player.y;

			collidePoint = collidePoint / (player.height / 2); // Return a value between 1 and -1 which 1 is bottom and -1 is top

			if (collidePoint < 0.50 && collidePoint > 0.25 || collidePoint > -0.50 && collidePoint < -0.25) // Increase low angle between 0.25 and 0.50 to 0.5 to increase afressivity
				(collidePoint >= 0) ? collidePoint = 0.50 : collidePoint = -0.50;

			let angleRad = collidePoint * (Math.PI / 4); // Angle in radiant between 45 and -45deg

			let direction = (this.ball.x < this.canvas.width / 2) ? 1 : -1; // To reverse x direction

			this.ball.ballDirectionX = direction * this.speed * Math.cos(angleRad);
			this.ball.ballDirectionY = this.speed * Math.sin(angleRad);
			this.speed += 0.5;
			(direction === 1) ? this.ball.changeBallInfos(false) : this.ball.changeBallInfos(true);
		}
	}


	wallCollision() {
		// X should be deleted to score a goal
		if (this.ball.x + this.ball.ballRadius > this.canvas.width)
			this.ball.ballDirectionX = this.ball.ballDirectionX * -1;
		if (this.ball.x - this.ball.ballRadius < 0)
			this.ball.ballDirectionX = this.ball.ballDirectionX * -1;

		if (this.ball.y + this.ball.ballRadius > this.canvas.height)
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
		if (this.ball.y - this.ball.ballRadius < 0) {
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
		}
	}


	// ------------------------------------- Move players ------------------------------------- //

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
		this.movePlayerDelay(newPosY, this.playerOne, () => this.playerOne.y += newPosY);
	}


	movePlayerTwo() {
		let newPosY = 0;

		if (this.keysPlayerTwo.up)
			newPosY = -2;
		if (this.keysPlayerTwo.down)
			newPosY = 2;
		this.movePlayerDelay(newPosY, this.playerTwo, () => this.playerTwo.y += newPosY);
	}


	movePlayerDelay(newPosY, player, callback) {
		let i = 0;

		const intervalId = setInterval(() => {
			if (this.checkPlayerHitBox(newPosY, player)) {
				clearInterval(intervalId);
				return ;
			}
			callback();
			i++;
			if (i === 10)
				clearInterval(intervalId);
		}, 1);
	}


	checkPlayerHitBox(newPosY, player) {
		if (player.y + newPosY + player.height / 2 + 5 > this.canvas.height)
			return true;
		if (player.y + newPosY - player.height / 2 - 5 < 0)
			return true;
		return false;
	}

}