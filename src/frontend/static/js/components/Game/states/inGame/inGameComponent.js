import Game from './Game.js';
import { sendRequest } from '../../../../utils/sendRequest.js';

export let gameInstance;

class InGameComponent extends HTMLElement {
	constructor() {
		super();

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
		gameInstance = new Game(this.canvas, this.gameId, this.gameState);
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
}

customElements.define('in-game-component', InGameComponent);