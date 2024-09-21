export default class Ball {
	constructor(canvas, x, y, height,width) {
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
		this.ballColor = 'rgb(189, 195, 199)';
		this.ballSize = canvas.width * 0.005;
		this.ballRadius = 15;
		this.rotationAngle = 0;
	}


	draw(primaryColor, secondaryColor) {
		this.drawTrail(primaryColor, secondaryColor);
		this.drawBall();
		this.drawBallTexture();
	}


	drawTrail(primaryColor, secondaryColor) {
		const coordinates = {
			x: this.x - 10,
			y: this.y,
		}

		let subtractBy = 0; // To change the size of trail
		let multiplier = 1; // To draw on negative or positive

		for (let i = 0; i < 4; i++) {
			(i % 2 === 0) ? subtractBy = 0 : subtractBy = 3;
			(i % 2 === 0) ? this.canvas.ctx.fillStyle = primaryColor : this.canvas.ctx.fillStyle = secondaryColor;
			if (i === 2)
				multiplier = -1;

		this.canvas.ctx.beginPath();
		this.canvas.ctx.lineTo(coordinates.x, coordinates.y);
		this.canvas.ctx.lineTo(coordinates.x , coordinates.y + (5 * multiplier));
		this.canvas.ctx.arcTo(coordinates.x, coordinates.y + (25 * multiplier) - (subtractBy * multiplier), coordinates.x + 25, coordinates.y + (15 * multiplier) - (subtractBy * multiplier), 25);
		this.canvas.ctx.arcTo(coordinates.x + 40, coordinates.y + (10 * multiplier) - (subtractBy * multiplier), coordinates.x + 60, coordinates.y + (25 * multiplier) - (subtractBy * multiplier), 25);
		this.canvas.ctx.lineTo(coordinates.x + 40, coordinates.y + (8 * multiplier) - (subtractBy * multiplier));
		this.canvas.ctx.arcTo(coordinates.x + 45, coordinates.y + (6 * multiplier) - (subtractBy * multiplier), coordinates.x + 60, coordinates.y + (15 * multiplier) - (subtractBy * multiplier), 25);
		this.canvas.ctx.arcTo(coordinates.x + 42, coordinates.y + (2 * multiplier) - (subtractBy * multiplier), coordinates.x + 40, coordinates.y + (2 * multiplier) - (subtractBy * multiplier), 25);
		this.canvas.ctx.lineTo(coordinates.x + 48, coordinates.y + (6 * multiplier) - (subtractBy * multiplier));
		this.canvas.ctx.arcTo(coordinates.x + 48, coordinates.y + (6 * multiplier) - (subtractBy * multiplier), coordinates.x + 100, coordinates.y, 25);
		this.canvas.ctx.lineTo(coordinates.x + 100, coordinates.y);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
		}
	}


	drawBall() {
		// Ball background
		this.canvas.ctx.fillStyle = 'rgb(0, 0, 0)';
		this.canvas.ctx.beginPath();
		this.canvas.ctx.arc(this.x, this.y, this.ballRadius + 3, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();

		// Ball foreground
		this.canvas.ctx.fillStyle = this.ballColor;
		this.canvas.ctx.beginPath();
		this.canvas.ctx.arc(this.x, this.y, this.ballRadius, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}


	drawBallTexture() {
		this.rotationAngle += Math.PI / 16;

		const ellipseCoordinatesX = [
			this.x + Math.cos(Math.PI / 6 + Math.PI + this.rotationAngle)  * (this.ballRadius - 2),
			this.x + Math.cos(-Math.PI / 6 + this.rotationAngle)  * (this.ballRadius - 2),
			this.x + Math.cos(Math.PI / 2 + this.rotationAngle)  * (this.ballRadius - 2)
		];
		const ellipseCoordinatesY = [
			this.y + Math.sin(Math.PI / 6 + Math.PI + this.rotationAngle)  * (this.ballRadius - 2),
			this.y + Math.sin(-Math.PI / 6 + this.rotationAngle)  * (this.ballRadius - 2),
			this.y + Math.sin(Math.PI / 2 + this.rotationAngle)  * (this.ballRadius - 2),
		];
		const ellipseRotation = [
			Math.PI / 5.7 + this.rotationAngle,
			-Math.PI / 5.7+ this.rotationAngle,
			-Math.PI / 2 + this.rotationAngle
		]

		for(let i = 0; i < 3; i++) {
			this.drawBallTextureLine(ellipseCoordinatesX[i], ellipseCoordinatesY[i]);
			this.drawBallTextureEllipse(ellipseCoordinatesX[i], ellipseCoordinatesY[i], ellipseRotation[i]);
		}

	}


	drawBallTextureLine(endPosX, endPosY) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(this.x, this.y);
		this.canvas.ctx.lineTo(endPosX, endPosY);
		this.canvas.ctx.strokeStyle= '#000000';
		this.canvas.ctx.lineWidth = 1;
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}


	drawBallTextureEllipse(x, y, ellipseRotation) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = 'rgb(30, 32, 43)';
		this.canvas.ctx.ellipse(x, y, 4, 7, ellipseRotation, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = 'rgb(0, 206, 255)';
		this.canvas.ctx.ellipse(x, y, 3, 6, ellipseRotation, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}

}