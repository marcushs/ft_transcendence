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
		this.initCanvas();
	}


	initializeComponent() {
		this.innerHTML = `
			<canvas></canvas>
		`;
	}


	connectedCallback() {
		new Game(this.canvas, this.attributes['ball-speed'].value, this.attributes['paddle-speed'].value, this.attributes['score-to-win'].value);
		this.initCanvas();
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