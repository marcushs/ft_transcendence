export default class Intro {
	constructor(canvas, isRanked, leftPlayer, rightPlayer) {
		this.canvas = canvas;
		this.isAnimationEnabled = false;
		this.isCountDownEnabled = false;
		this.countDownNumber = '3';

		this.leftPlayer = leftPlayer;
		this.rightPlayer = rightPlayer;

		this.isRanked = isRanked;

		localStorage.removeItem("isSearchingPrivateMatch");
		localStorage.removeItem("isReadyToPlay");
		localStorage.removeItem("isInGuestState");

		this.initializeImages();
		this.initializeCoordinates();
	}


	loadImage(path) {
		const img = new Image();

		img.src = path;
		return img;
	}


	initializeImages() {
		this.backgroundImage = this.loadImage("../../../../../assets/gameStartAnimationBackground.svg");

		this.playerOneImage = this.loadImage(this.leftPlayer.profile_image);
		this.playerTwoImage = this.loadImage(this.rightPlayer.profile_image);
	}


	initializeCoordinates() {
		this.leftSectionTopRightX = this.canvas.width / 2 + 200;
		this.leftSectionBottomRightX = this.canvas.width / 2 - 200;

		this.rightSectionTopLeftX = this.canvas.width / 2 - 200;
		this.rightSectionBottomLeftX = this.canvas.width / 2 + 200;

		this.vLetterX = this.canvas.width / 2 - 50;
		this.sLetterX = this.canvas.width / 2 + 95;

		this.leftPlayerX = this.canvas.width / 4;
		this.rightPlayerX = this.canvas.width / 4 * 3;
	}


	drawIntro() {
		if (this.isCountDownEnabled)
			this.drawCountDown();
		else
			this.drawIntroAnimation();
	}


	drawCountDown() {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.font = '220px Russo one';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(this.countDownNumber, this.canvas.width / 2, this.canvas.height / 2 - 30);
		this.canvas.ctx.closePath();
	}


	drawIntroAnimation() {
		this.drawLeftSection();
		this.drawRightSection();

		this.drawVS();
		if (this.isAnimationEnabled)
			this.updateCoordinates();

		if (this.leftSectionTopRightX < 0)
			this.updateCountDown();
	}

	drawLeftSection() {
		this.canvas.ctx.save();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(0, 0);
		this.canvas.ctx.lineTo(this.leftSectionTopRightX, 0);
		this.canvas.ctx.lineTo(this.leftSectionBottomRightX, this.canvas.height + 3);
		this.canvas.ctx.lineTo(0, this.canvas.height + 3);
		this.canvas.ctx.clip();
		this.canvas.ctx.drawImage(this.backgroundImage, this.leftSectionTopRightX - this.canvas.width / 2 - 200, 0, this.canvas.width + 3, this.canvas.height + 3);
		this.canvas.ctx.fillStyle = 'rgba(0, 208, 255, 0.65)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
		this.canvas.ctx.closePath();

		this.drawPlayer(this.leftPlayerX, this.canvas.height / 4 * 2.8, this.playerOneImage, this.leftPlayer.username);
		this.drawLine(this.leftSectionTopRightX, this.leftSectionBottomRightX);
	}


	drawRightSection() {
		this.canvas.ctx.save();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(this.rightSectionBottomLeftX, 0);
		this.canvas.ctx.lineTo(this.rightSectionTopLeftX, this.canvas.height);
		this.canvas.ctx.lineTo(this.canvas.width, this.canvas.height);
		this.canvas.ctx.lineTo(this.canvas.width, 0);
		this.canvas.ctx.clip();
		this.canvas.ctx.drawImage(this.backgroundImage, this.rightSectionTopLeftX - this.canvas.width / 2 + 200, 0, this.canvas.width + 3, this.canvas.height + 3);
		this.canvas.ctx.fillStyle = 'rgba(255, 22, 198, 0.65)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
		this.canvas.ctx.closePath();

		this.drawPlayer(this.rightPlayerX, this.canvas.height / 4, this.playerTwoImage, this.rightPlayer.username);
		this.drawLine(this.rightSectionBottomLeftX, this.rightSectionTopLeftX);
	}


	drawPlayer(x, y, playerImage, playerName) {
		const radius = 100;

		this.drawPlayerShadow(x, y, radius);
		this.drawPlayerImg(x, y, radius, playerImage);
		this.drawPlayerName(x, y + 135, playerName);
	}


	drawPlayerShadow(x, y, radius) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		this.canvas.ctx.shadowBlur = 25;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}


	drawPlayerImg(x, y, radius, playerImage) {
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.canvas.ctx.clip();
		this.canvas.ctx.drawImage(playerImage, x - radius, y - radius, radius * 2, radius * 2);
		this.canvas.ctx.closePath();
		this.canvas.ctx.restore();
	}


	drawPlayerName(x, y, playerName) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		this.canvas.ctx.shadowBlur = 25;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.font = '50px Russo one';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(playerName, x, y);
		this.canvas.ctx.closePath();
	}


	drawLine(topX, bottomX) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.moveTo(topX, 0)
		this.canvas.ctx.lineTo(bottomX, this.canvas.height + 3);
		this.canvas.ctx.lineWidth = 2;
		this.canvas.ctx.line
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();
	}


	drawVS() {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.font = '220px Russo one';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText('V', this.vLetterX, this.canvas.height / 2 - 30);
		this.canvas.ctx.fillText('S',  this.sLetterX, this.canvas.height / 2 + 30);
		this.canvas.ctx.closePath();
	}


	updateCoordinates() {
		this.leftSectionTopRightX -= 10;
		this.leftSectionBottomRightX -= 10;
		this.rightSectionTopLeftX += 10;
		this.rightSectionBottomLeftX += 10;

		this.vLetterX -= 10;
		this.sLetterX += 10;

		this.leftPlayerX -= 10;
		this.rightPlayerX += 10;
	}


	updateCountDown() {
		const countDownArray = ['2', '1'];
		let i = 0;

		const intervalId = setInterval(() => {
			this.countDownNumber = countDownArray[i++];
			if (i > 1)
				clearInterval(intervalId);
		}, 1000);
		this.isCountDownEnabled = true;
	}

}
