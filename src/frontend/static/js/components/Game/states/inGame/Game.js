import { throwRedirectionEvent } from "../../../../utils/throwRedirectionEvent.js";
import { disconnectWebSocket } from "./gameWebsocket.js";
import getUserId from "../../../../utils/getUserId.js";
import { resetGameInstance } from "./inGameComponent.js";
import { socket } from "./gameWebsocket.js";
import Player from "./Player.js";
import Spark from "./Spark.js";
import Ball from "./Ball.js";
import Intro from "./Intro.js";

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

export default class Game {
	constructor(canvas, gameId, gameState, userId) {
		this.gameInProgress = true;
		this.userId = userId;
		this.canvas = canvas;
		this.gameId = gameId;
		this.gameState = gameState;
		this.isGameRunning = false;

		this.Intro = new Intro(this.canvas);

		this.initGameRender();
		this.renderLoop();

	}

// --------------------------------------- Constructor method -------------------------------------- //

	initGameRender() {
		this.speed = this.gameState.ball_speed;
		this.speedLimit = this.gameState.speedLimit;
		this.ball = new Ball(this.canvas, this.gameState.ball_position.x, this.gameState.ball_position.y, this.speed);
		const playerOneBackId = Number(this.gameState.player_one.id);
		const playerTwoBackId = Number(this.gameState.player_two.id);

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

		setTimeout(() => {
			this.Intro.isAnimationEnabled = true;
		}, 3000);
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
		this.drawSparks();
		if (!this.isGameRunning)
			this.Intro.drawIntro();

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
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({
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
		if (this.isGameRunning)
			this.drawScore();
		this.drawMiddleLine();
		this.playerOne.draw();
		this.playerTwo.draw();
		this.ball.draw();
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

	drawSparks() {
		for (let i = 0; i < this.sparks.length; i++) {
			this.sparks[i].update(this.deltaTime);

			this.sparks[i].draw(this.canvas.ctx);
			if (!this.sparks[i].isAlive())
				this.sparks.splice(i, 1);
		}
	}

// --------------------------------------- Update render -------------------------------------- //

	updateGameRender(newState) {
		this.updatePlayerCollisionsHit(newState);

		if (!this.isGameRunning) {
			this.isGameRunning = true;
		}

		this.updatePlayersPosition(newState);
		this.updateBallPosition(newState);

		if (this.playerOneScore !== newState.player_one_score || this.playerTwoScore !== newState.player_two_score) {
			this.resetUserInputs();
			this.updateScore(newState);
		}
		if (newState.has_ball_hit_wall)
			this.generateSparks(this.ball.x, this.ball.y, "#FF16C6");
	}


	updatePlayerCollisionsHit(newState) {
		if (newState.is_player_one_collide) {
			this.playerOne.isPlayerHit = true;
			this.playerOne.hitTime = performance.now();
		}
		if (newState.is_player_two_collide) {
			this.playerTwo.isPlayerHit = true;
			this.playerTwo.hitTime = performance.now();
		}
	}


// --------------------------------------- Update render method -------------------------------------- //

	attachEventsListener() {
		document.addEventListener('keydown', event => this.handleKeyDown(event));
		document.addEventListener('keyup', event => this.handleKeyUp(event));
	}

	handleKeyUp(event) {
		if (this.isGameRunning) {
			if (event.key === 'w') this.keysPlayerOne.up = false;
			if (event.key === 's') this.keysPlayerOne.down = false;
			if (event.key === 'W') this.keysPlayerOne.up = false;
			if (event.key === 'S') this.keysPlayerOne.down = false;
		}
	}

	handleKeyDown(event) {
		if (this.isGameRunning) {
			if (event.key === 'w') this.keysPlayerOne.up = true;
			if (event.key === 's') this.keysPlayerOne.down = true;
			if (event.key === 'W') this.keysPlayerOne.up = true;
			if (event.key === 'S') this.keysPlayerOne.down = true;
		}
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
		if (newState.ball_direction_x !== this.ball.ballDirectionX)
			this.ball.changeBallDirectionInfos(newState.ball_direction_x < 0);
		this.ball.ballDirectionX = newState.ball_direction_x;
		this.ball.ballDirectionY = newState.ball_direction_y;
		if (this.ball.isRoundStarted !== newState.is_round_started)
			this.ball.isRoundStarted = newState.is_round_started;
		if (newState.is_round_started === true)
			this.ball.resetBallInfos();
	}

	updateScore(newState) {
		if (this.playerOneScore !== newState.player_one_score || this.playerTwoScore !== newState.player_two_score) {
			this.isGameRunning = false;
			this.playerOneScore = newState.player_one_score;
			this.playerTwoScore = newState.player_two_score;
		}
	}

// --------------------------------------- Game finished render -------------------------------------- //

	gameFinished(message) {
		this.gameInProgress = false;
		alert(message);
		disconnectWebSocket(this.userId, false);
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
		disconnectWebSocket(this.userId, false);
		throwRedirectionEvent('/');
	}

	updateMessage(message) {
		console.log(message);
	}

	resetUserInputs() {
		this.keysPlayerOne.up = false;
		this.keysPlayerOne.down = false;
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

	        let spark = new Spark(x, sparkY, angle, speed, lifetime, this.deltaTime);
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


}