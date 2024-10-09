export default class Player {
	constructor(canvas, isPlayerOne, playerId) {
		this.canvas = canvas;
		this.isPlayerOne = isPlayerOne;
		this.playerId = playerId;
		this.color = (isPlayerOne) ? 'rgb(0, 206, 255)': 'rgb(255, 22, 198)';
		this.hitColor = (isPlayerOne) ? 'rgb(3, 114, 155)': 'rgb(146, 0, 117)';
		this.x = (isPlayerOne) ? this.canvas.width * 0.015 : this.canvas.width - this.canvas.width * 0.015;
		this.y = this.canvas.height / 2;
		this.width = this.canvas.width * 0.005;
		this.height = this.canvas.height * 0.2;
		this.radius = 6;
		this.isPlayerHit = false;
		this.hitTime = -1;
		this.hitDuration = 100;
	}


	draw() {
		this.playerHitColor();
		if (this.isPlayerHit)
			this.canvas.ctx.fillStyle = this.hitColor;
		else
			this.canvas.ctx.fillStyle = this.color;

		this.canvas.ctx.beginPath();

		if (this.isPlayerOne)
			this.drawPlayerOne();
		else
			this.drawPlayerTwo();

		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}


	drawPlayerOne() {
		this.canvas.ctx.lineTo(this.x, this.y);
		this.canvas.ctx.lineTo(this.x - (this.width / 2), this.y);
		this.canvas.ctx.arcTo(this.x - (this.width / 2), this.y - (this.height / 2) - this.radius, this.x - (this.width / 2) + this.radius, this.y - (this.height / 2) - this.radius, this.radius);
		this.canvas.ctx.lineTo(this.x + (this.width / 2), this.y - (this.height / 2) - this.radius);
		this.canvas.ctx.arcTo(this.x + (this.width / 2) + this.radius, this.y - (this.height / 2) - this.radius, this.x + (this.width / 2) + this.radius, this.y - (this.height / 2), this.radius);
		this.canvas.ctx.lineTo(this.x + (this.width / 2) + this.radius, this.y + (this.height / 2));
		this.canvas.ctx.arcTo(this.x + (this.width / 2) + this.radius, this.y + (this.height / 2) + this.radius, this.x + (this.width / 2), this.y + (this.height / 2) + this.radius, this.radius);
		this.canvas.ctx.lineTo(this.x + this.radius, this.y + (this.height / 2) + this.radius);
		this.canvas.ctx.arcTo(this.x - (this.width / 2), this.y + (this.height / 2) + this.radius, this.x - (this.width / 2), this.y + (this.height / 2), this.radius);
		this.canvas.ctx.lineTo(this.x - (this.width / 2), this.y);
	}


	drawPlayerTwo() {
		this.canvas.ctx.lineTo(this.x, this.y);
		this.canvas.ctx.lineTo(this.x + (this.width / 2), this.y);
		this.canvas.ctx.arcTo(this.x + (this.width / 2), this.y - (this.height / 2) - this.radius, this.x + (this.width / 2) - this.radius, this.y - (this.height / 2) - this.radius, this.radius);
		this.canvas.ctx.lineTo(this.x - (this.width / 2), this.y - (this.height / 2) - this.radius);
		this.canvas.ctx.arcTo(this.x - (this.width / 2) - this.radius, this.y - (this.height / 2) - this.radius, this.x - (this.width / 2) - this.radius, this.y - (this.height / 2), this.radius);
		this.canvas.ctx.lineTo(this.x - (this.width / 2) - this.radius, this.y + (this.height / 2));
		this.canvas.ctx.arcTo(this.x - (this.width / 2) - this.radius, this.y + (this.height / 2) + this.radius, this.x - (this.width / 2), this.y + (this.height / 2) + this.radius, this.radius);
		this.canvas.ctx.lineTo(this.x - this.radius, this.y + (this.height / 2) + this.radius);
		this.canvas.ctx.arcTo(this.x + (this.width / 2), this.y + (this.height / 2) + this.radius, this.x + (this.width / 2), this.y + (this.height / 2), this.radius);
		this.canvas.ctx.lineTo(this.x + (this.width / 2), this.y);
	}


	playerHitColor() {
		if (this.isPlayerHit)
			if (performance.now() > this.hitTime + this.hitDuration)
				this.isPlayerHit = false;
	}

}