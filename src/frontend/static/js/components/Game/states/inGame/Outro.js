import Spark from "./Spark.js";
import {getString} from "../../../../utils/languageManagement.js";


export default class Outro {
	constructor(canvas, isRanked) {
		this.canvas = canvas;

		this.isWin = true;
		this.isRanked = isRanked;

		this.backgroundOpacity = 0;
		this.resultFontSize = 1500;

		this.sparks = [];
		this.lastTime = performance.now();
		this.deltaTime = (performance.now() - this.lastTime) / 1000;

		this.isResultDrawable = false;
		this.isSparksDrawable = false;
		this.attachEventsListeners();
	}


	attachEventsListeners() {
		document.addEventListener('loadOutroAnimationEvent', (event) => {
			this.isWin = event.detail.isWin;
			this.updateBackgroundOpacity();
		});
	}


	drawOutro() {
		this.deltaTime = (performance.now() - this.lastTime) / 1000;
		this.drawBackground();
		if (this.isResultDrawable)
			this.drawResult();
	}


	drawBackground() {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = `rgba(0, 0, 0, ${this.backgroundOpacity})`;
		this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas.ctx.closePath();
	}


	drawResult() {
		if (this.isSparksDrawable)
			this.drawSparks();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = (this.isWin) ? `rgba(0, 206, 255, 1)` : `rgba(255, 22, 198, 1)`;
		this.canvas.ctx.font = `bold ${this.resultFontSize}px Poppins`;
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText((this.isWin) ? getString("gameOutro/win") : getString("gameOutro/lose"), this.canvas.width / 2, this.canvas.height / 2);
		this.canvas.ctx.closePath();
	}


	updateBackgroundOpacity() {
		const intervalId = setInterval(() => {
			this.backgroundOpacity += 0.01;
			if (this.backgroundOpacity >= 0.75) {
				this.waitToDrawResult();
				clearInterval(intervalId);
			}
		}, 7);
	}


	waitToDrawResult() {
		setTimeout(() => {
			this.isResultDrawable = true;
			this.updateResult();
		}, 750);
	}


	// Need refactor
	updateResult() {
		const intervalId = setInterval(() => {
			if (this.resultFontSize > 180) {
				this.resultFontSize -= 30;
			} else if (this.isWin) {
				if (this.isWin)
					this.generateSparks(this.canvas.width / 2, this.canvas.height / 2);
				this.isSparksDrawable = true;
				clearInterval(intervalId);
			} else {
				clearInterval(intervalId);
			}
		}, 10);
	}


	drawSparks() {
		for (let i = 0; i < this.sparks.length; i++) {
			this.sparks[i].update(this.deltaTime);

			this.sparks[i].draw(this.canvas.ctx);
			if (!this.sparks[i].isAlive())
				this.sparks.splice(i, 1);
		}
	}

	generateSparks(x, y) {
		const numberOfSparks = 350;
		const angleRange = [0, 2 * Math.PI];

		for (let i = 0; i < numberOfSparks; i++) {
			const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
			const speed = 20 + Math.random() * 50;
			const lifetime = 3 + Math.random() * 2;

			let color = (i % 2 === 0) ? "rgb(255, 165, 0)" : "#00ceff";

			let spark = new Spark(x, y, angle, speed, lifetime, this.deltaTime, 5, color);
			this.sparks.push(spark);
		}
	}

}
