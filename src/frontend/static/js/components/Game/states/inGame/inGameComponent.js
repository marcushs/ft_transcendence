import { throwGameDisconnectEvent } from '../../../../utils/throwGameDisconnectEvent.js';
import Game from './Game.js';

export let gameInstance = null;

class InGameComponent extends HTMLElement {
	constructor() {
		super();

		this.userId = null;
		this.gameId = null;
		this.gameState = null;
		this.map_dimension = null;
		this.canvas = {
			element: null,
			ctx: null,
			height: 0,
			width: 0
		}
		this.angle = 0;
	}

	connectedCallback() {
		this.initializeComponent();
		this.setInitialMapSize();
		this.initCanvas();
		console.log('init instance : ', this.gameId);
		gameInstance = new Game(this.canvas, this.gameId, this.gameState, this.userId);
		console.log('game instance : ', gameInstance);
		localStorage.setItem('inGameComponentState', JSON.stringify(this.saveState()))
	}

	setState(newState) {
		console.log('newstate reached: ', newState);
		
		this.userId = newState.userId;
		this.gameId = newState.gameId;
		this.gameState = newState.gameState;
		this.map_dimension = newState.map_dimension
	}

	saveState() {
		return {
			userId: this.userId,
			gameId: this.gameId,
			gameState: this.gameState,
			map_dimension: this.map_dimension,
		}
	}

	initializeComponent() {
		this.innerHTML = `
			<canvas></canvas>
		`;
	}

	setInitialMapSize() {
		this.canvas.height = this.map_dimension.height;
		this.canvas.width = this.map_dimension.width;
	}

	initCanvas() {
		this.canvas.element = this.querySelector('canvas');

		this.canvas.ctx = this.canvas.element.getContext('2d');
		this.setCanvasSize();
		this.scaleCanvas();
	}


	setCanvasSize() {
		const devicePixelRatio = window.devicePixelRatio || 1;

		this.canvas.element.width = this.canvas.element.clientWidth * devicePixelRatio;
		this.canvas.element.height = this.canvas.element.clientHeight * devicePixelRatio;
	}


	scaleCanvas() {
		const scaleX = this.canvas.element.width / this.canvas.width;
		const scaleY = this.canvas.element.height / this.canvas.height;

		this.canvas.ctx.scale(scaleX, scaleY);
	}

	async disconnectedCallback() {
		console.log('GAME INSTANCE: ', gameInstance);
		if (gameInstance)
			throwGameDisconnectEvent(this.userId);
	}
}

customElements.define('in-game-component', InGameComponent);

export function resetGameInstance() {
	gameInstance = null;
}