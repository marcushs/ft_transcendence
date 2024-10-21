import { throwGameInactivityEvent } from '../../../../utils/throwGameInactivityEvent.js';
import Game from './Game.js';
import { disconnectWebSocket } from './gameWebsocket.js';

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
		gameInstance = new Game(this.canvas, this.gameId, this.gameState, this.userId);
		localStorage.setItem('inGameComponentState', JSON.stringify(this.saveState()))
	}

	setState(newState) {		
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
		if (gameInstance) {
			disconnectWebSocket(this.userId, true);
			gameInstance.cleanup();
			throwGameInactivityEvent();
		}
	}
}

customElements.define('in-game-component', InGameComponent);

export function resetGameInstance() {
	gameInstance = null;
}