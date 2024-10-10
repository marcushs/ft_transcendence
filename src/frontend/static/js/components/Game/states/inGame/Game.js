import Player from "./Player.js";
import Ball from "./Ball.js";
import Spark from "./Spark.js";
import { socket } from "./gameWebsocket.js";

export function startGame(gameId, initialGameState, map_dimension) {
	const onlineHomeDiv = document.querySelector('.states-container');
	const oldDivContent = onlineHomeDiv.innerHTML;

	const inGameComponent = document.createElement('in-game-component');
	inGameComponent.gameId = gameId;
	inGameComponent.gameState = initialGameState;
	inGameComponent.map_dimension = map_dimension;
	onlineHomeDiv.innerHTML = '';
	onlineHomeDiv.appendChild(inGameComponent);
}

export default class Game {
	constructor(canvas, gameId, gameState) {
		this.canvas = canvas;
		this.gameId = gameId;
		this.gameState = gameState;
		this.initGameRender();
	}

	initGameRender() {
		console.log('initial game state in game class method initGameRender: ', this.gameState);
		this.speed = this.gameState.ball_speed;
		this.speedLimit = this.gameState.speedLimit;
		console.log('canvas size width : ', this.canvas.width / 2, 'test width with back :', this.gameState.ball_position.x); 
		
		this.ball = new Ball(this.canvas, this.gameState.ball_position.x, this.gameState.ball_position.y, this.speed);
		this.playerOne = new Player(this.canvas, true, '2dewf-23fsdv23-32fff');
		this.playerTwo = new Player(this.canvas, false, '2dewf-23fsdv23-32fff');
		this.playerOneScore = this.gameState.player_one.score;
		this.playerTwoScore = this.gameState.player_two.score;
		this.sparks = [];
		this.lastTime = performance.now();
		this.keysPlayerOne = {
			up: false,
			down: false,
		}
		this.keysPlayerTwo = {
			up: false,
			down: false,
		}
		this.drawFrame();
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
	}


	gameRender() {
		this.deltaTime = (performance.now() - this.lastTime) / 1000;
		this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		this.canvas.ctx.font = '500px Russo One';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(`${this.playerTwoScore}`, this.canvas.width / 4, this.canvas.height / 2 + 35);
		this.canvas.ctx.fillText(`${this.playerOneScore}`, this.canvas.width / 4 * 3, this.canvas.height / 2 + 35);
		this.drawFrame();
		this.movePlayers();
		this.moveBall();
		this.update();
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
			// if (isPlayerOne)ss
			// 	this.generateSparks(this.ball.x, this.ball.y, 'left', true, false, 'rgb(0, 206, 255)');
			// else
			// 	this.generateSparks(this.ball.x, this.ball.y, 'right', false, true, 'rgb(255, 22, 198)');

			this.ball.ballDirectionX = speed;

			let collidePoint = this.ball.y - player.y;

			collidePoint = collidePoint / (player.height / 2); // Return a value between 1 and -1 which 1 is bottom and -1 is top

			// if (collidePoint < 0.50 && collidePoint > 0.10 || collidePoint > -0.50 && collidePoint < -0.10) // Increase low angle between 0.25 and 0.50 to 0.5 to increase afressivity
			// 	(collidePoint >= 0) ? collidePoint = 0.50 : collidePoint = -0.50;

			let angleRad = collidePoint * (Math.PI / 4); // Angle in radiant between 45 and -45deg

			let direction = (this.ball.x < this.canvas.width / 2) ? 1 : -1; // To reverse x direction

			if (this.speed < this.speedLimit)
				this.speed += 0.5;

			this.ball.ballDirectionX = direction * this.speed * Math.cos(angleRad);
			this.ball.ballDirectionY = this.speed * Math.sin(angleRad);
			(direction === 1) ? this.ball.changeBallInfos(false) : this.ball.changeBallInfos(true);
		}
	}


	generateSparks(x, y, side, isPlayerOne, isPlayerTwo, color) {
		let numberOfSparks = 100;
		let angleRange;

		switch(side) {
	        case 'top':
	            angleRange = [-Math.PI, 0];
	            break;
	        case 'bottom':
	            angleRange = [Math.PI / 2, -(Math.PI)];
	            break;
			case 'left':
	            angleRange = [Math.PI / 2, (3 * Math.PI) / 2];
	            break;
	        case 'right':
	            angleRange = [Math.PI / 2, (3 * Math.PI) / 2];
	            // angleRange = [Math.PI / 2, (Math.PI / 2)];
	            break;
	        default:
	            angleRange = [0, 2 * Math.PI];
	    }
	    for (let i = 0; i < numberOfSparks; i++) {
			let angle;
			let speed;

			if (isPlayerTwo)
		        angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
			else
		        angle = angleRange[0] - Math.random() * (angleRange[1] - angleRange[0]);

			if (isPlayerOne || isPlayerTwo)
		        speed = (this.speed / 4) + Math.random() * (this.speed / 4);
			else
		        speed = (this.speed / 3) + Math.random() * (this.speed / 3);
	        let lifetime = 0.5 + Math.random() * 0.5;

			let sparkX = x;
			let sparkY = y;
			if (side === 'top')
				sparkY = y - this.ball.ballRadius;
			if (side === 'bottom')
				sparkY = y + this.ball.ballRadius;
			if (side === 'left')
				sparkX = x - this.ball.ballRadius;
			if (side === 'right')
				sparkX = x + this.ball.ballRadius;
			// sparkX = (side === '')
		    // console.log(sparkY, sparkX)

	        let spark = new Spark(sparkX, sparkY, angle, speed, lifetime, this.deltaTime, color);
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
		if (this.ball.x - this.ball.ballRadius < 15) {

			this.speed = 15;
			this.ball.x = this.canvas.width / 2;
			this.ball.y = this.canvas.height / 2;
			this.playerOneScore++;
			// document.querySelector('.player2').innerHTML = `${this.playerOneScore}`;
			this.ball.offsetTrailHeight = -12;
			this.ball.offsetTrailWidth = -10;
			this.ball.ballDirectionY = 0;
			this.ball.ballDirectionX = this.speed;
			this.playerOne.y = this.canvas.height / 2;
			this.playerTwo.y = this.canvas.height / 2;
		}
		if (this.ball.x + this.ball.ballRadius > this.canvas.width - 15) {

			this.speed = 15;
			this.ball.x = this.canvas.width / 2;
			this.ball.y = this.canvas.height / 2;
			this.playerTwoScore++;
			// document.querySelector('.player1').innerHTML = `${this.playerTwoScore}`;
			this.ball.offsetTrailHeight = -12;
			this.ball.offsetTrailWidth = -10;
			this.ball.ballDirectionY = 0;
			this.ball.ballDirectionX = this.speed;
			this.playerOne.y = this.canvas.height / 2;
			this.playerTwo.y = this.canvas.height / 2;
		}


	}


	wallCollision() {
		// X should be deleted to score a goal
		if (this.ball.x + this.ball.ballRadius > this.canvas.width)
			this.ball.ballDirectionX = this.ball.ballDirectionX * -1;
		if (this.ball.x - this.ball.ballRadius < 0)
			this.ball.ballDirectionX = this.ball.ballDirectionX * -1;

		if (this.ball.y + this.ball.ballRadius > this.canvas.height) {
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
			this.generateSparks(this.ball.x, this.ball.y, 'bottom', false, false, 'rgb(255, 165, 0)')
		}
		if (this.ball.y - this.ball.ballRadius < 0) {
			this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
			this.generateSparks(this.ball.x, this.ball.y, 'top', false, false, 'rgb(255, 165, 0)');
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