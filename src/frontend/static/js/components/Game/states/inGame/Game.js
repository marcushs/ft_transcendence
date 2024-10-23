import { throwRedirectionEvent } from "../../../../utils/throwRedirectionEvent.js";
import { disconnectGameWebSocket } from "./gameWebsocket.js";
import getUserId from "../../../../utils/getUserId.js";
import { resetGameInstance } from "./inGameComponent.js";
import { gameSocket } from "./gameWebsocket.js";
import Player from "./Player.js";
import Spark from "./Spark.js";
import Ball from "./Ball.js";

export async function startGame(gameId, initialGameState, map_dimension) {
	localStorage.removeItem('isSearchingGame');
	const userId = await getUserId();
	let statesContainerDiv = document.querySelector('.states-container');
	if (!statesContainerDiv) {
		throwRedirectionEvent('/');
		statesContainerDiv = document.querySelector('.states-container');
	}
	statesContainerDiv.innerHTML = '';
	for (let i = 0; i < statesContainerDiv.classList.length; i++) {
		if (statesContainerDiv.classList[i] === 'states-container')
			continue;
		statesContainerDiv.classList.remove(statesContainerDiv.classList[i])
	}
	const inGameComponent = document.createElement('in-game-component');
	inGameComponent.gameId = gameId;
	inGameComponent.gameState = initialGameState;
	inGameComponent.map_dimension = map_dimension;
	inGameComponent.userId = userId;
	statesContainerDiv.appendChild(inGameComponent);
}

// export async function startGame(gameId, initialGameState, map_dimension) {
// 	const userId = await getUserId();
// 	const onlineHomeDiv = document.querySelector('.states-container');
// 	const oldDivContent = onlineHomeDiv.innerHTML;

// 	const inGameComponent = document.createElement('in-game-component');
// 	inGameComponent.gameId = gameId;
// 	inGameComponent.gameState = initialGameState;
// 	inGameComponent.map_dimension = map_dimension;
// 	inGameComponent.userId = userId;
// 	onlineHomeDiv.innerHTML = '';
// 	onlineHomeDiv.appendChild(inGameComponent);
// }

export default class Game {
	constructor(canvas, gameId, gameState, userId) {		
		this.gameInProgress = true;
		this.userId = userId;
		this.canvas = canvas;
		this.gameId = gameId;
		this.gameState = gameState;
		this.initGameRender();
		this.renderLoop();
	}

// --------------------------------------- Constructor method -------------------------------------- //

	initGameRender() {
		this.isGameRunning = false
		this.speed = this.gameState.ball_speed;
		this.speedLimit = this.gameState.speedLimit;		
		this.ball = new Ball(this.canvas, this.gameState.ball_position.x, this.gameState.ball_position.y, this.speed);
		const playerOneBackId = Number(this.gameState.player_one.id)
		const playerTwoBackId = Number(this.gameState.player_two.id)

		if (this.userId === playerOneBackId) {
			this.playerOne = new Player(this.canvas, true, playerOneBackId);
			this.playerTwo = new Player(this.canvas, false, playerTwoBackId);
		} else {
			this.playerOne = new Player(this.canvas, true, playerTwoBackId);
			this.playerTwo = new Player(this.canvas, false, playerOneBackId);
		}		
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
		this.attachEventsListener();
	}

// --------------------------------------- Render loop -------------------------------------- //

	renderLoop() {
		if (!this.gameInProgress) {
			this.cleanup();
			return;
		}
		this.deltaTime = (performance.now() - this.lastTime) / 1000;
		this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.movePlayer();
		this.drawFrame();
		// this.update();
		requestAnimationFrame(() => this.renderLoop());
	}

// --------------------------------------- Render loop Method -------------------------------------- //

	// send websocket message for updating player position
	movePlayer() {
		let action = null;
		if (this.keysPlayerOne.up)
			action = 'move_up';
		if (this.keysPlayerOne.down)
			action = 'move_down'
		if (action) {			
			if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
				gameSocket.send(JSON.stringify({
					'type': 'player_action',
					'game_id': this.gameId,
					'player_id': this.playerOne.playerId,
					'action' : action
				}));		
			}
		}
	}

	// Draw new frame render
	drawFrame() {
		this.drawScore();
		this.drawMiddleLine();
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw('rgb(255, 22, 198)', 'rgb(146, 0, 117)');
	}

	drawScore() {
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
		this.canvas.ctx.font = '500px Russo One';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(`${this.playerTwoScore}`, this.canvas.width / 4, this.canvas.height / 2 + 35);
		this.canvas.ctx.fillText(`${this.playerOneScore}`, this.canvas.width / 4 * 3, this.canvas.height / 2 + 35);
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

	// !! need refactoring to match with the remote game !!
	update() {
		for (let i = 0; i < this.sparks.length; i++) {
			this.sparks[i].update(this.deltaTime);

			this.sparks[i].draw(this.canvas.ctx);
			if (!this.sparks[i].isAlive())
				this.sparks.splice(i, 1);
		}
	}

// --------------------------------------- Update render -------------------------------------- //

	updateGameRender(newState) {
		if (!this.isGameRunning) {
			this.isGameRunning = true;
		}
		this.updatePlayersPosition(newState);
		this.updateBallPosition(newState);
		if (this.playerOneScore !== newState.player_one_score || this.playerTwoScore !== newState.player_two_score)
			this.updateScore(newState);
	}

// --------------------------------------- Update render method -------------------------------------- //

	attachEventsListener() {
		document.addEventListener('keydown', (event) => {
			if (this.isGameRunning) {
				if (event.key === 'w') this.keysPlayerOne.up = true;
				if (event.key === 's') this.keysPlayerOne.down = true;
				if (event.key === 'W') this.keysPlayerOne.up = true;
				if (event.key === 'S') this.keysPlayerOne.down = true;
			}
		});
		document.addEventListener('keyup', (event) => {
				if (event.key === 'w') this.keysPlayerOne.up = false;
				if (event.key === 's') this.keysPlayerOne.down = false;
				if (event.key === 'W') this.keysPlayerOne.up = false;
				if (event.key === 'S') this.keysPlayerOne.down = false;
		});
	}

	updatePlayersPosition(newState) {
		if (this.playerOne.y !== newState.player_one_y)
			this.playerOne.y = newState.player_one_y;
		if (this.playerTwo.y !== newState.player_two_y)
			this.playerTwo.y = newState.player_two_y;
	}

	updateBallPosition(newState) {
		this.ball.x = newState.ball_x;
		this.ball.y = newState.ball_y;
	}

	updateScore(newstate) {
		if (this.playerOneScore !== newstate.player_one_score || this.playerTwoScore !== newstate.player_two_score) {
			this.isGameRunning = false;
			this.playerOneScore = newstate.player_one_score;
			this.playerTwoScore = newstate.player_two_score;
		}
	}

// --------------------------------------- Game finished render -------------------------------------- //

	gameFinished(message) {
		this.gameInProgress = false;
		alert(message);
		disconnectGameWebSocket(this.userId, false);
		throwRedirectionEvent('/');
	}

	cleanup() {
		resetGameInstance();
		this.gameInProgress = false;
		this.detachEventsListener();
	}
	
	detachEventsListener() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}
	
	canceledGame(message) {
		this.gameInProgress = false;
		alert(`Game canceled: ${message}`);
		disconnectGameWebSocket(this.userId, false);
		throwRedirectionEvent('/');
	}

	updateMessage(message) {
		console.log(message);
	}

	// moveBall() {
	// 	this.checkBallHitBox();
	// }

	// checkBallHitBox() {
	// 	this.playerCollision(this.playerOne, this.speed, () => this.ball.x + this.ball.ballDirectionX - this.ball.ballRadius < this.playerOne.x + this.playerOne.width / 2, true);
	// 	this.playerCollision(this.playerTwo, -this.speed, () => this.ball.x + this.ball.ballDirectionX + this.ball.ballRadius > this.playerTwo.x - this.playerTwo.width / 2, false);
	// 	this.wallCollision();

	// 	this.ball.x += this.ball.ballDirectionX;
	// 	this.ball.y += this.ball.ballDirectionY;
	// }


	// playerCollision(player, speed, calculateXPosition, isPlayerOne) {
	// 	if ((this.ball.y + this.ball.ballDirectionY - this.ball.ballRadius < player.y + player.height / 2 + this.ball.ballRadius / 2 &&
	// 		this.ball.y + this.ball.ballDirectionY + this.ball.ballRadius >  player.y - player.height / 2 - this.ball.ballRadius / 2) && calculateXPosition()) {
	// 		player.hitTime = performance.now();
	// 		player.isPlayerHit = true;

	// 		this.ball.ballDirectionX = speed;

	// 		let collidePoint = this.ball.y - player.y;

	// 		collidePoint = collidePoint / (player.height / 2); // Return a value between 1 and -1 which 1 is bottom and -1 is top

	// 		let angleRad = collidePoint * (Math.PI / 4); // Angle in radiant between 45 and -45deg

	// 		let direction = (this.ball.x < this.canvas.width / 2) ? 1 : -1; // To reverse x direction

	// 		if (this.speed < this.speedLimit)
	// 			this.speed += 0.5;

	// 		this.ball.ballDirectionX = direction * this.speed * Math.cos(angleRad);
	// 		this.ball.ballDirectionY = this.speed * Math.sin(angleRad);
	// 		(direction === 1) ? this.ball.changeBallInfos(false) : this.ball.changeBallInfos(true);
	// 	}
	// }


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


	// wallCollision() {
	// 	// X should be deleted to score a goal
	// 	if (this.ball.x + this.ball.ballRadius > this.canvas.width)
	// 		this.ball.ballDirectionX = this.ball.ballDirectionX * -1;
	// 	if (this.ball.x - this.ball.ballRadius < 0)
	// 		this.ball.ballDirectionX = this.ball.ballDirectionX * -1;

	// 	if (this.ball.y + this.ball.ballRadius > this.canvas.height) {
	// 		this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
	// 		this.generateSparks(this.ball.x, this.ball.y, 'bottom', false, false, 'rgb(255, 165, 0)')
	// 	}
	// 	if (this.ball.y - this.ball.ballRadius < 0) {
	// 		this.ball.ballDirectionY = this.ball.ballDirectionY * -1;
	// 		this.generateSparks(this.ball.x, this.ball.y, 'top', false, false, 'rgb(255, 165, 0)');
	// 	}
	// }


	// ------------------------------------- Move players ------------------------------------- //


	// movePlayerOne() {
	// 	let key = null;
	// 	if (this.keysPlayerOne.up)
	// 		key = 'key_up';
	// 	if (this.keysPlayerOne.down)
	// 		key = 'key_down'
	// 	if (key) {
	// 		socket.send(JSON.stringify({
	// 			'type': 'player_move',
	// 			'player_id': this.playerOne.id,
	// 			'key' : key
	// 		}));		
	// 	}

	// 	// this.movePlayerDelay(newPosY, this.playerOne, () => this.playerOne.y += newPosY);
	// }


	// movePlayerTwo() {
	// 	let newPosY = 0;

	// 	if (this.keysPlayerTwo.up)
	// 		newPosY = -2;
	// 	if (this.keysPlayerTwo.down)
	// 		newPosY = 2;
	// 	this.movePlayerDelay(newPosY, this.playerTwo, () => this.playerTwo.y += newPosY);
	// }


	// movePlayerDelay(newPosY, player, callback) {
	// 	let i = 0;

	// 	const intervalId = setInterval(() => {
	// 		if (this.checkPlayerHitBox(newPosY, player)) {
	// 			clearInterval(intervalId);
	// 			return ;
	// 		}
	// 		callback();
	// 		i++;
	// 		if (i === 10)
	// 			clearInterval(intervalId);
	// 	}, 1);
	// }

	// checkPlayerHitBox(newPosY, player) {
	// 	if (player.y + newPosY + player.height / 2 + 5 > this.canvas.height)
	// 		return true;
	// 	if (player.y + newPosY - player.height / 2 - 5 < 0)
	// 		return true;
	// 	return false;
	// }

}