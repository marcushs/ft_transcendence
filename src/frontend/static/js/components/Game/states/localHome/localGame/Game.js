import Player from "./Player.js";
import Ball from "./Ball.js";
import Spark from "./Spark.js";
import Intro from "./Intro.js";
import Outro from "./Outro.js";
import {throwRedirectionEvent} from "../../../../../utils/throwRedirectionEvent.js";

export default class Game {
	constructor(canvas, ballSpeed, paddleSpeed, scoreToWin) {
		const ballSpeeds = [5, 6, 7, 8, 9, 10, 11, 12, 13];

		this.canvas = canvas;
		this.startSpeed = ballSpeeds[Number(ballSpeed) - 1];
		this.speed = this.startSpeed;
		this.speedLimit = this.speed + 30;
		this.paddlesSpeed = Number(paddleSpeed) + 4;
		this.ball = new Ball(canvas, canvas.width / 2, canvas.height / 2, this.speed);
		this.playerOne = new Player(canvas, true);
		this.playerTwo = new Player(canvas, false);
		this.Intro = new Intro(this.canvas);
		this.isIntroAnimationEnabled = true;
		this.Outro = new Outro(this.canvas);
		this.playerOneScore = 0;
		this.playerTwoScore = 0;
		this.sparks = [];
		this.isTopBarOpened = false;
		this.lastTime = performance.now();

		this.keysPlayerOne = {
			up: false,
			down: false,
		}
		this.keysPlayerTwo = {
			up: false,
			down: false,
		}
		this.scoreToWin = Number(scoreToWin);
		this.isGameFinished = false;
		this.attachEventsListener();
		this.gameLoop();

		setTimeout(() => {
			this.Intro.isAnimationEnabled = true;
		}, 3000);
		setTimeout(() => {
			this.isIntroAnimationEnabled = false;
		}, 7300);

		this.gameTopBar = document.querySelector('game-top-bar');
		this.gameTopBar.classList.add('in-game-top-bar');
	}


	attachEventsListener() {
		document.addEventListener('keydown', (event) => {
			if (event.key === 'w') this.keysPlayerOne.up = true;
			if (event.key === 's') this.keysPlayerOne.down = true;
			if (event.key === 'W') this.keysPlayerOne.up = true;
			if (event.key === 'S') this.keysPlayerOne.down = true;
			if (event.key === 'ArrowUp') this.keysPlayerTwo.up = true;
			if (event.key === 'ArrowDown') this.keysPlayerTwo.down = true;
		});


		document.addEventListener('keyup', (event) => {
			if (event.key === 'w') this.keysPlayerOne.up = false;
			if (event.key === 's') this.keysPlayerOne.down = false;
			if (event.key === 'W') this.keysPlayerOne.up = false;
			if (event.key === 'S') this.keysPlayerOne.down = false;
			if (event.key === 'ArrowUp') this.keysPlayerTwo.up = false;
			if (event.key === 'ArrowDown') this.keysPlayerTwo.down = false;
		});

		document.querySelector('game-top-bar .increase-game-top-bar-button').addEventListener('click', () => this.handleIncreaseTopBar());
		document.querySelector('game-top-bar').addEventListener('mouseleave', () => this.handleDecreaseTopBar());
	}


	gameLoop() {
		this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (this.isIntroAnimationEnabled) {
			this.drawFrame();
			this.Intro.drawIntro();
		} else if (!this.isGameFinished) {
			this.drawGame();
			this.drawFrame();
		} else {
			this.drawScore();
			this.drawFrame();
			this.Outro.drawOutro();
		}

		requestAnimationFrame(() => this.gameLoop());
	}


	drawGame() {
		this.deltaTime = (performance.now() - this.lastTime) / 1000;
		this.drawScore();
		this.movePlayers();
		this.moveBall();
		this.update();
	}


	drawScore() {
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		this.canvas.ctx.font = '500px Russo One';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(`${this.playerOneScore}`, this.canvas.width / 4, this.canvas.height / 2 + 35);
		this.canvas.ctx.fillText(`${this.playerTwoScore}`, this.canvas.width / 4 * 3, this.canvas.height / 2 + 35);
	}


	drawFrame(gameInfos) {
		this.drawMiddleLine();
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw('rgb(255, 22, 198)', 'rgb(146, 0, 117)');
	}


	drawMiddleLine() {
		this.canvas.fillStyle = '#fff';
		this.canvas.ctx.beginPath();
		const gradient = this.canvas.ctx.createLinearGradient(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
		gradient.addColorStop(0, 'rgb(255, 22, 198)');
		gradient.addColorStop(1, 'rgb(0, 206, 255)');
		this.canvas.ctx.lineWidth = 5;
		this.canvas.ctx.strokeStyle = gradient;
		this.canvas.ctx.moveTo(this.canvas.width / 2, 0);
		this.canvas.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();

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
		if ((this.ball.y + this.ball.ballDirectionY - this.ball.ballRadius < player.y + player.height / 2 + this.ball.ballRadius / 2 &&
			this.ball.y + this.ball.ballDirectionY + this.ball.ballRadius >  player.y - player.height / 2 - this.ball.ballRadius / 2) && calculateXPosition()) {
			player.hitTime = performance.now();
			player.isPlayerHit = true;

			this.ball.ballDirectionX = speed;

			let collidePoint = this.ball.y - player.y;

			collidePoint = collidePoint / (player.height / 2);

			let angleRad = collidePoint * (Math.PI / 4);

			let direction = (this.ball.x < this.canvas.width / 2) ? 1 : -1;

			if (this.speed < this.speedLimit)
				this.speed += 0.5;

			this.ball.ballDirectionX = direction * this.speed * Math.cos(angleRad);
			this.ball.ballDirectionY = this.speed * Math.sin(angleRad);
			(direction === 1) ? this.ball.changeBallInfos(false) : this.ball.changeBallInfos(true);
		}
	}


	generateSparks(x, y) {
		const numberOfSparks = 100;
		const angleRange = [0, 2 * Math.PI];

		for (let i = 0; i < numberOfSparks; i++) {
			const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
			const speed = (this.speed / 4) + Math.random() * (this.speed / 4);
			const lifetime = 0.5 + Math.random() * 0.5;

			let sparkY;

			(y < 50) ? sparkY = 0 : sparkY = this.canvas.height;

			let spark = new Spark(x, sparkY, angle, speed, lifetime, this.deltaTime, 2, "rgb(255, 165, 0)");
			this.sparks.push(spark);
		}
	}


	update() {
		for (let i = 0; i < this.sparks.length; i++) {
			this.sparks[i].update(this.deltaTime);

			this.sparks[i].draw(this.canvas.ctx);
			if (!this.sparks[i].isAlive())
				this.sparks.splice(i, 1);
		}

		if (this.ball.x - this.ball.ballRadius < 15)
			this.handlePlayerTwoScore();
		if (this.ball.x + this.ball.ballRadius > this.canvas.width - 15)
			this.handlePlayerOneScore();

	}


	handlePlayerOneScore() {
		if (++this.playerOneScore === this.scoreToWin) {
			this.endGame("PLAYER 1");
			return ;
		}

		this.speed = this.startSpeed;
		this.ball.ballDirectionX = this.speed;
		this.ball.resetBallInfos(true);
		this.playerOne.y = this.canvas.height / 2;
		this.playerTwo.y = this.canvas.height / 2;
	}


	handlePlayerTwoScore() {
		if (++this.playerTwoScore === this.scoreToWin) {
			this.endGame("PLAYER 2");
			return ;
		}

		this.speed = this.startSpeed;
		this.ball.ballDirectionX = -this.speed;
		this.ball.resetBallInfos(false);
		this.playerOne.y = this.canvas.height / 2;
		this.playerTwo.y = this.canvas.height / 2;
	}


	endGame(winnerName) {
		this.isGameFinished = true;
		this.throwLoadOutroAnimationEvent(winnerName);
		setTimeout(() => {
			throwRedirectionEvent('/');
		}, 7000);
	}


	wallCollision() {
		if (this.ball.y + this.ball.ballRadius > this.canvas.height) {
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
			this.generateSparks(this.ball.x, this.ball.y)
		}
		if (this.ball.y - this.ball.ballRadius < 0) {
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
			this.generateSparks(this.ball.x, this.ball.y);
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
			if (i === this.paddlesSpeed)
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


	handleIncreaseTopBar() {
		this.gameTopBar.style.animation = "increase-top-bar-size 0.25s linear forwards";
		document.querySelector('game-top-bar .extend-game-button').style.visibility = 'visible';
		document.querySelector('game-top-bar .reduce-game-button').style.visibility = 'visible';
		setTimeout(() => { this.isTopBarOpened = true; }, 250);
	}

	handleDecreaseTopBar() {
		if (this.isTopBarOpened) {
			this.gameTopBar.style.animation = "decrease-top-bar-size 0.25s linear forwards";
			this.isTopBarOpened = false;
			this.gameTopBar.classList.add('in-game-top-bar');
			document.querySelector('game-top-bar .increase-game-top-bar-button').style.visibility = 'visible';
			document.querySelector('game-top-bar .extend-game-button').style.visibility = 'hidden';
			document.querySelector('game-top-bar .reduce-game-button').style.visibility = 'hidden';
		}
	}


	throwLoadOutroAnimationEvent(winnerName) {
		const event = new CustomEvent('loadOutroAnimationEvent', {
			bubbles: true,
			detail: {
				winnerName: winnerName
			}
		});

		document.dispatchEvent(event);
	}

}