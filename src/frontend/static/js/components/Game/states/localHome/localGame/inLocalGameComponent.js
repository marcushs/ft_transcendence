import Game from './Game.js';

class InLocalGameComponent extends HTMLElement {
	constructor() {
		super();

		this.canvas = {
			element: null,
			ctx: null,
			height: 1000,
			width: 1587.30
		}
		this.angle = 0;
		this.initializeComponent();
	}


	initializeComponent() {
		this.innerHTML = `
			<canvas></canvas>
		`;
	}


	connectedCallback() {
		this.initCanvas();
		new Game(this.canvas);
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

customElements.define('in-local-game-component', InLocalGameComponent);