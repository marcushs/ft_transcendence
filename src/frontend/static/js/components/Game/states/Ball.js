export default class Ball {
	constructor(canvas, x, y, ballSpeed) {
		this.canvas = canvas;
		this.x = x;
		this.y = y;
		this.ballRadius = 16;
		this.rotationSpeed = 0.01;
		this.rotationAngle = 0;
		this.isPositiveBallDirection = true;
		this.ballColor = 'rgb(189, 195, 199)';
		this.bluePrimaryColor = 'rgb(0, 206, 255)';
		this.blueSecondaryColor = 'rgb(3, 114, 155)';
		this.pinkPrimaryColor = 'rgb(255, 22, 198)';
		this.pinkSecondaryColor = 'rgb(146, 0, 117)';
		this.ballDirectionX = ballSpeed;
		this.ballDirectionY = ballSpeed;
		this.offsetTrailHeight = -12;
		this.offsetTrailWidth = -10;
		this.baseBlue = 255;
		this.basePink = 255;
		this.increaseBlue = false;
		this.increasePink = false;
	}


	changeBallInfos(isPositiveBallDirection) {
		this.rotationSpeed += 0.05;
		this.offsetTrailHeight += 0.25;
		this.offsetTrailWidth += 0.3;
		this.isPositiveBallDirection = isPositiveBallDirection;
	}


	draw(primaryColor, secondaryColor) {
		this.drawTrail(primaryColor, secondaryColor);
		this.drawBall();
		this.drawBallTexture();
		this.updateTrailColors()
	}


	drawTrail(primaryColor, secondaryColor) {
		let angle = Math.atan2(this.ballDirectionY, this.ballDirectionX); // Get the angle direction of the ball
	    this.canvas.ctx.save(); // Save the current state of the context to apply translation and rotation separately from the rest.
	    this.canvas.ctx.translate(this.x, this.y); // Set the x and y coordinate as origin coordinates

	    this.canvas.ctx.rotate(angle); // Rotate according to angle

		let subtractBy = 0; // To change the size of trail
		let multiplier = 1; // To invert the drawing direction for symmetry

		// Loop to draw the shapes of the trail with different colors and sizes
		for (let i = 0; i < 4; i++) {
			(i % 2 === 0) ? subtractBy = 0 : subtractBy = 5;
			if (this.isPositiveBallDirection)
				(i % 2 === 0) ? this.canvas.ctx.fillStyle = this.pinkPrimaryColor : this.canvas.ctx.fillStyle = this.pinkSecondaryColor;
			else
				(i % 2 === 0) ? this.canvas.ctx.fillStyle = this.bluePrimaryColor : this.canvas.ctx.fillStyle = this.blueSecondaryColor;
			if (i === 2)
				multiplier = -1;

		this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(0, 0);
        this.canvas.ctx.lineTo(0, (5 + this.offsetTrailHeight + subtractBy) * multiplier);
        this.canvas.ctx.arcTo(0, (25 + this.offsetTrailHeight + subtractBy) * multiplier, -15, (15 + this.offsetTrailHeight + subtractBy) * multiplier, 20);
        this.canvas.ctx.arcTo(-30, (10 + this.offsetTrailHeight + subtractBy) * multiplier, -50, (20 + this.offsetTrailHeight + subtractBy) * multiplier, 20);
        this.canvas.ctx.lineTo(-30, (8 + this.offsetTrailHeight + subtractBy) * multiplier);
        this.canvas.ctx.arcTo(-35, (6 + this.offsetTrailHeight + subtractBy) * multiplier, -50, (15 + this.offsetTrailHeight + subtractBy) * multiplier, 20);
        this.canvas.ctx.arcTo(-32, (2 + this.offsetTrailHeight + subtractBy) * multiplier, -30, (2 + this.offsetTrailHeight + subtractBy) * multiplier, 20);
        this.canvas.ctx.lineTo(-38, (6 + this.offsetTrailHeight + subtractBy) * multiplier);
        this.canvas.ctx.arcTo(-38, (6 + this.offsetTrailHeight + subtractBy) * multiplier, -90, 0, 25);
        this.canvas.ctx.lineTo(-90 - this.offsetTrailWidth * 10, 0);
        this.canvas.ctx.closePath();
        this.canvas.ctx.fill();
		}

	   this.canvas.ctx.restore(); // To restore context as previous context
	}


	updateTrailColors() {
		if (!this.isPositiveBallDirection) {
			if (this.increaseBlue) {
				this.bluePrimaryColor = `rgb(0, ${this.baseBlue - 50}, ${this.baseBlue})`;
				if (this.baseBlue === 255)
					this.increaseBlue = false;
				this.baseBlue += 5;
			} else {
				this.bluePrimaryColor = `rgb(0, ${this.baseBlue - 50}, ${this.baseBlue})`;
				if (this.baseBlue === 155)
					this.increaseBlue = true;
				this.baseBlue -= 5;
			}
		} else {
			if (this.increasePink) {
				this.pinkPrimaryColor = `rgb(${this.basePink}, 22, ${this.basePink * 0.8})`;
				if (this.basePink === 255)
					this.increasePink = false;
				this.basePink += 5;
			} else {
				this.pinkPrimaryColor = `rgb(${this.basePink}, 22, ${this.basePink * 0.8})`;
				if (this.basePink === 155)
					this.increasePink = true;
				this.basePink -= 5;
			}
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
		if (!this.isPositiveBallDirection)
			this.rotationAngle += this.rotationSpeed;
		else
			this.rotationAngle += -this.rotationSpeed;

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
		this.canvas.ctx.fillStyle = 'rgb(0, 0, 0)';
		this.canvas.ctx.ellipse(x, y, 4, 7, ellipseRotation, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();

		this.canvas.ctx.beginPath();
		if (this.isPositiveBallDirection)
			this.canvas.ctx.fillStyle = this.pinkPrimaryColor;
		else
			this.canvas.ctx.fillStyle = this.bluePrimaryColor;
		this.canvas.ctx.ellipse(x, y, 3, 6, ellipseRotation, 0, 2 * Math.PI);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}

}