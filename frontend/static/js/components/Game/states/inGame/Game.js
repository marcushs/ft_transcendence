import { throwRedirectionEvent } from "../../../../utils/throwRedirectionEvent.js";
import { waitForStatesContainer } from "../../../../utils/game/gameConnection.js";
import { gameSocket, websocketReconnection } from "./gameWebsocket.js";
import { disconnectGameWebSocket } from "./gameWebsocket.js";
import getUserId from "../../../../utils/getUserId.js";
import { resetGameInstance } from "./inGameComponent.js";
import Player from "./Player.js";
import Spark from "./Spark.js";
import Ball from "./Ball.js";
import Intro from "./Intro.js";
import Outro from "./Outro.js";
import CircularList from "../../../../utils/CircularList.js";
import RankOutro from "./RankOutro.js";
import { sendRequest } from "../../../../utils/sendRequest.js";

export async function startGame(gameId, initialGameState, map_dimension) {
	localStorage.removeItem('isSearchingGame');
	const matchmakingSearchPopUp = document.querySelector('matchmaking-research-component')
	if (matchmakingSearchPopUp)
		matchmakingSearchPopUp.remove();
	if (window.location.pathname !== '/') {
		throwRedirectionEvent('/');
		await waitForStatesContainer();
	}
	const userId = await getUserId();
	const statesContainerDiv = document.querySelector('.states-container');

	if (statesContainerDiv.querySelector('in-game-component'))
		return;
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
		this.gameType = gameState.game_type;
		this.userId = userId;
		this.canvas = canvas;
		this.gameId = gameId;
		this.gameState = gameState;
		this.isGameRunning = false;
		this.isIntroAnimationEnabled = true;
		this.isOutroAnimationEnabled = false;
		this.isRankOutroAnimationEnabled = false;
		this.isSentEmoteAnimationEnabled = false;
		this.isReceivedEmoteAnimationEnabled = false;

		this.is_ranked = (this.gameType === 'ranked') ? true : false;

		this.Intro = new Intro(this.canvas, this.is_ranked, gameState.player_two.user_infos, gameState.player_one.user_infos);
		this.Outro = new Outro(this.canvas, this.is_ranked);
		if (this.is_ranked)
			this.RankOutro = new RankOutro(this.canvas);

		this.gameTopBar = document.querySelector('game-top-bar');
		this.gameTopBar.classList.add('in-game-top-bar');

		this.initEmotesLists();
		this.initGameRender();
		this.renderLoop();
	}

// --------------------------------------- Constructor method -------------------------------------- //

	initGameRender() {
		this.isGameRunning = false
		this.speed = this.gameState.ball_speed;
		this.speedLimit = this.gameState.speedLimit;
		this.ball = new Ball(this.canvas, this.gameState.ball_position.x, this.gameState.ball_position.y, this.speed);
		const playerOneBackId = this.gameState.player_one.id;
		const playerTwoBackId = this.gameState.player_two.id;

		if (this.userId !== playerOneBackId) {
			this.isLeftPlayer = true;
			this.playerOne = new Player(this.canvas, true, playerOneBackId);
			this.playerTwo = new Player(this.canvas, false, playerTwoBackId);
		} else {
			this.isLeftPlayer = false;
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
		this.attachEventsListener();

		setTimeout(() => {
			this.Intro.isAnimationEnabled = true;
		}, 3000);
	}

	attachEventsListener() {
		document.addEventListener('keydown', event => this.handleKeyDown(event));
		document.addEventListener('keyup', event => this.handleKeyUp(event));

		document.addEventListener('sendEmoteEvent', event => this.handleSentEvent(event));
		document.addEventListener('receivedEmoteEvent', event => this.handleReceivedEmote(event));

		document.querySelector('game-top-bar .increase-game-top-bar-button').addEventListener('click', () => this.handleIncreaseTopBar());
		document.querySelector('game-top-bar').addEventListener('mouseleave', () => this.handleDecreaseTopBar());
	}

	loadImage(path) {
		const img = new Image();

		img.src = path;
		return img;
	}

	initEmotesLists() {
		this.sentEmoteFramesList = null;
		this.receivedEmoteFramesList = null;

		let framesArr = [];

		for (let i = 0; i < 18; i++)
			framesArr.push(this.loadImage(`../../../../../../assets/emotes/happy/frames/${i}.gif`));
		this.happyFramesList = new CircularList(framesArr);
		framesArr = [];

		for (let i = 0; i < 12; i++)
			framesArr.push(this.loadImage(`../../../../../../assets/emotes/mad/frames/${i}.gif`));
		this.madFramesList = new CircularList(framesArr);
		framesArr = [];

		for (let i = 0; i < 39; i++)
			framesArr.push(this.loadImage(`../../../../../../assets/emotes/cry/frames/${i}.gif`));
		this.cryFramesList = new CircularList(framesArr);
		framesArr = [];

		for (let i = 0; i < 9; i++)
			framesArr.push(this.loadImage(`../../../../../../assets/emotes/laugh/frames/${i}.gif`));
		this.laughFramesList = new CircularList(framesArr);
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
		if (this.isIntroAnimationEnabled)
			this.Intro.drawIntro();
		if (this.isOutroAnimationEnabled)
			this.Outro.drawOutro();
		if (this.isRankOutroAnimationEnabled)
			this.RankOutro.drawRankOutro();
		this.drawEmotes();

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
		if (!this.isIntroAnimationEnabled)
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
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		this.canvas.ctx.shadowBlur = 50;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
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

	drawEmotes() {
		if (this.isSentEmoteAnimationEnabled) {
			this.sentEmoteFrame = this.sentEmoteFramesList.get();
			this.drawSentEmote(this.sentEmoteFrame, this.isLeftPlayer);
		}

		if (this.isReceivedEmoteAnimationEnabled) {
			this.receivedEmoteFrame = this.receivedEmoteFramesList.get();
			this.drawReceivedEmote(this.receivedEmoteFrame, this.isLeftPlayer);
		}
	}

	drawSentEmote(emoteFrame, isLeftPlayer) {
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		if (isLeftPlayer)
			this.canvas.ctx.scale(-1, 1);
		if (emoteFrame) {
			if (isLeftPlayer)
				this.canvas.ctx.drawImage(emoteFrame, -175, this.canvas.height - 150, 175, 150);
			else
				this.canvas.ctx.drawImage(emoteFrame, this.canvas.width - 175, 0, 175, 150);
		}
		this.canvas.ctx.translate(this.canvas.width, 0);
		this.canvas.ctx.fillStyle = 'rgba(0, 208, 255, 0.65)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
		this.canvas.ctx.closePath();
	}

	drawReceivedEmote(emoteFrame, isLeftPlayer) {
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		if (!isLeftPlayer)
			this.canvas.ctx.scale(-1, 1);
		if (emoteFrame) {
			if (isLeftPlayer)
				this.canvas.ctx.drawImage(emoteFrame, this.canvas.width - 175, 0, 175, 150);
			else
				this.canvas.ctx.drawImage(emoteFrame, -175, this.canvas.height - 150, 175, 150);
		}
		this.canvas.ctx.translate(this.canvas.width, 0);
		this.canvas.ctx.fillStyle = 'rgba(0, 208, 255, 0.65)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
		this.canvas.ctx.closePath();
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

		if (!this.isGameRunning)
			this.isGameRunning = true;
		if (this.isIntroAnimationEnabled)
			this.isIntroAnimationEnabled = false;

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

// --------------------------------------- Handler methods -------------------------------------- //

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

	handleSentEvent(event) {
		this.sentEmoteFramesList = this.getEmoteFramesListByType(event.detail.emoteType);

		if (gameSocket && gameSocket.readyState === WebSocket.OPEN) {
			gameSocket.send(JSON.stringify({
				'type': 'emote_sent',
				'game_id': this.gameId,
				'player_id': this.playerOne.playerId,
				'emote_type' : event.detail.emoteType,
			}));
		}

		this.isSentEmoteAnimationEnabled = true;
		setTimeout(() => {
			this.isSentEmoteAnimationEnabled = false;
		}, 3500);
	}

	handleReceivedEmote(event) {
		this.receivedEmoteFramesList = this.getEmoteFramesListByType(event.detail.emoteType);

		this.isReceivedEmoteAnimationEnabled = true;
		setTimeout(() => {
			this.isReceivedEmoteAnimationEnabled = false;
		}, 3500);
	}

	getEmoteFramesListByType(emoteType) {
		let emoteFramesList;

		if (emoteType === "happy")
			emoteFramesList = this.happyFramesList;
		if (emoteType === "mad")
			emoteFramesList = this.madFramesList;
		if (emoteType === "cry")
			emoteFramesList = this.cryFramesList;
		if (emoteType === "laugh")
			emoteFramesList = this.laughFramesList;

		return emoteFramesList;
	}

	handleIncreaseTopBar() {
		this.gameTopBar.style.animation = "increase-top-bar-size 0.25s linear forwards";
		document.querySelector('game-top-bar emotes-component').style.visibility = 'visible';
		document.querySelector('game-top-bar .extend-game-button').style.visibility = 'visible';
		document.querySelector('game-top-bar .reduce-game-button').style.visibility = 'visible';
		setTimeout(() => { this.isTopBarOpened = true; }, 250);
	}

	handleDecreaseTopBar() {
		if (this.isTopBarOpened) {
			this.gameTopBar.style.animation = "decrease-top-bar-size 0.25s linear forwards";
			this.isTopBarOpened = false;
			this.gameTopBar.classList.add('in-game-top-bar');
			document.querySelector('game-top-bar emotes-component').style.visibility = 'hidden';
			document.querySelector('game-top-bar .increase-game-top-bar-button').style.visibility = 'visible';
			document.querySelector('game-top-bar .extend-game-button').style.visibility = 'hidden';
			document.querySelector('game-top-bar .reduce-game-button').style.visibility = 'hidden';
		}
	}

// --------------------------------------- Game finished render -------------------------------------- //

	gameFinished(isWin, data) {
		localStorage.removeItem("inGameComponentState");
		this.throwLoadOutroAnimationEvent(isWin);
		this.isOutroAnimationEnabled = true;

		if (this.gameType === "private_match") {
			localStorage.removeItem("isSearchingPrivateMatch");
			localStorage.removeItem("isReadyToPlay");
			localStorage.removeItem("isInGuestState");
		}

		setTimeout(() => {
			this.isOutroAnimationEnabled = false;
			if (!this.is_ranked) {
				this.gameInProgress = false;
				disconnectGameWebSocket(this.userId, false);
				throwRedirectionEvent('/');
			} else {
				this.isRankOutroAnimationEnabled = true;
				this.throwLoadRankOutroAnimationEvent(data.message, isWin);
				setTimeout(() => {
					this.gameInProgress = false;
					disconnectGameWebSocket(this.userId, false);
					if (this.gameType !== 'tournament')
						throwRedirectionEvent('/');
				}, 6000);
			}
		}, 7000);
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
		disconnectGameWebSocket(this.userId, false);
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

	        let spark = new Spark(x, sparkY, angle, speed, lifetime, this.deltaTime, 2, "rgb(255, 165, 0)");
	        this.sparks.push(spark);
	    }
	}

	throwLoadOutroAnimationEvent(isWin) {
		const event = new CustomEvent('loadOutroAnimationEvent', {
			bubbles: true,
			detail: {
				isWin: isWin
			}
		});

		document.dispatchEvent(event);
	}

	throwLoadRankOutroAnimationEvent(rankData, isWin) {
		const event = new CustomEvent('loadRankOutroAnimationEvent', {
			bubbles: true,
			detail: {
				rankData: rankData,
				isWin: isWin
			}
		});

		document.dispatchEvent(event);
	}

}
