

export default class Intro {
	constructor(canvas) {
		this.canvas = canvas;
		this.isAnimationEnabled = false;
		this.isCountDownEnabled = false;
		this.countDownNumber = '3';
		this.backgroundImage = new Image();
		this.backgroundImage.src = "../../../../../assets/gameStartAnimationBackground.svg";

		this.playersInfos = {
			playerOne: {
				name: "Theo",
				profileImage: "https://imgs.search.brave.com/iSAvbiep4QwLA-UQyDCBMZsxBkcoa3eu7mv2ycTyU3I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM1LmFscGhhY29k/ZXJzLmNvbS81OTMv/NTkzMzMzLmpwZw"
			},
			playerTwo: {
				name: "Alex",
				profileImage: "https://imgs.search.brave.com/yhsJnp0ftGpvmQ6t71zUYHHDynOvfO1xoG8mGtodmMk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmpl/dXhhY3R1cy5jb20v/ZGF0YXMvamV1eC9y/L28vcm9ja2V0LWxl/YWd1ZS92bi9yb2Nr/ZXQtbGVhZ3VlLTYx/NWU2NzY4MTZhZTYu/anBn"
			}
		}
		this.playerOneImage = new Image();
		this.playerOneImage.src = this.playersInfos.playerOne.profileImage;
		this.playerTwoImage = new Image();
		this.playerTwoImage.src = this.playersInfos.playerTwo.profileImage;


		this.leftSectionTopRightX = this.canvas.width / 2 + 200;
		this.leftSectionBottomRightX = this.canvas.width / 2 - 200;
		this.rightSectionTopLeftX = this.canvas.width / 2 - 200;
		this.rightSectionBottomLeftX = this.canvas.width / 2 + 200;

		this.vLetterX = this.canvas.width / 2 - 50;
		this.sLetterX = this.canvas.width / 2 + 95;

		this.playerOneInfosX = this.canvas.width / 4;
		this.playerTwoInfosX = this.canvas.width / 4 * 3;
	}


	drawLeftSection(topX, bottomX) {
		this.canvas.ctx.save();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(0, 0);
		this.canvas.ctx.lineTo(this.leftSectionTopRightX, 0);
		this.canvas.ctx.lineTo(this.leftSectionBottomRightX, this.canvas.height + 3);
		this.canvas.ctx.lineTo(0, this.canvas.height + 3);
		this.canvas.ctx.clip();
		this.canvas.ctx.drawImage(this.backgroundImage, this.leftSectionTopRightX - this.canvas.width / 2 - 200, 0, this.canvas.width + 3, this.canvas.height + 3);
		this.canvas.ctx.fillStyle = 'rgba(0, 208, 255, 0.45)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
		this.canvas.ctx.closePath();
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
		this.canvas.ctx.fillStyle = 'rgba(255, 22, 198, 0.45)';
		this.canvas.ctx.fill();
		this.canvas.ctx.restore();
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


	drawLetters() {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.font = '220px Russo one';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText('V', this.vLetterX, this.canvas.height / 2 - 30);
		this.canvas.ctx.fillText('S',  this.sLetterX, this.canvas.height / 2 + 30);
		this.canvas.ctx.closePath();
	}


	drawPlayer(x, y, playerImage, playerName) {
		const radius = 100;

		this.canvas.ctx.save();

		this.drawPlayerShadow(x, y, radius);

		this.canvas.ctx.beginPath();
		this.canvas.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.canvas.ctx.clip();
		this.canvas.ctx.drawImage(playerImage, x - radius, y - radius, radius * 2, radius * 2);
		this.canvas.ctx.closePath();
		this.canvas.ctx.restore();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		this.canvas.ctx.shadowBlur = 25;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.font = '50px Russo one';
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(playerName, x, y + 135);
		this.canvas.ctx.closePath();
	}


	drawPlayerShadow(x, y, radius) {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		this.canvas.ctx.shadowBlur = 25;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.canvas.ctx.closePath();
		this.canvas.ctx.fill();
	}


	drawIntroAnimation() {
		this.drawLeftSection();
		this.drawRightSection();

		this.drawLetters();
		this.drawPlayer(this.playerOneInfosX, this.canvas.height / 4 * 2.8, this.playerOneImage, this.playersInfos.playerOne.name);
		this.drawPlayer(this.playerTwoInfosX, this.canvas.height / 4, this.playerTwoImage, this.playersInfos.playerTwo.name);

		this.drawLine(this.leftSectionTopRightX, this.leftSectionBottomRightX);
		this.drawLine(this.rightSectionBottomLeftX, this.rightSectionTopLeftX);

		console.log(this.leftSectionTopRightX, this.leftSectionBottomRightX);

		if (this.isAnimationEnabled) {
			this.leftSectionTopRightX -= 10;
			this.leftSectionBottomRightX -= 10;
			this.rightSectionTopLeftX += 10;
			this.rightSectionBottomLeftX += 10;

			this.vLetterX -= 10;
			this.sLetterX += 10;

			this.playerOneInfosX -= 10;
			this.playerTwoInfosX += 10;
		}

		if (this.leftSectionTopRightX < 0) {
			let i = 0;
			const test = ['2', '1'];
			const intervalId = setInterval(() => {
				this.countDownNumber = test[i++];
				if (i > 1)
					clearInterval(intervalId);
			}, 1000);
			this.isCountDownEnabled = true;
		}
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


	drawIntro() {
		if (this.isCountDownEnabled)
			this.drawCountDown();
		else
			this.drawIntroAnimation();
	}

}