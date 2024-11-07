import Spark from "./Spark.js";


export default class RankOutro {
	constructor(canvas, rankData) {
		this.canvas = canvas;

		// this.rankData = rankData;
		//
		// this.isWin = true;

		this.rankColors = {
			bronze: '#C77428',
			silver: '#7F87B4',
			gold: '#FBC549',
			diamond: '#56C0FA',
			master: ['#00ceff', '#FF16C6']
		}

		this.rankPoints = {
			bronze: [0, 999],
			silver: [1000, 2999],
			gold: [3000, 5999],
			diamond: [6000, 9999],
			master: 10000
		}

		this.colorPercentage = null;

		this.rankImages = {
			bronze: null,
			silver: null,
			gold: null,
			diamond: null,
			master: null
		}

		this.rpImage = null;

		this.initializeImages();

		this.sparks = [];
		this.lastTime = performance.now();
		this.deltaTime = (performance.now() - this.lastTime) / 1000;

		// this.isResultDrawable = false;
		// this.isSparksDrawable = false;
		this.attachEventsListeners();
	}


	loadImage(path) {
		const img = new Image();

		img.src = path;
		return img;
	}


	initializeImages() {
		this.rankImages.bronze = this.loadImage('../../../../../assets/rank-bronze.svg');
		this.rankImages.silver = this.loadImage('../../../../../assets/rank-silver.svg');
		this.rankImages.gold = this.loadImage('../../../../../assets/rank-gold.svg');
		this.rankImages.diamond = this.loadImage('../../../../../assets/rank-diamond.svg');
		this.rankImages.master = this.loadImage('../../../../../assets/rank-master.svg');

		this.rpImage = this.loadImage('../../../../../assets/rp-logo.svg');
	}


	attachEventsListeners() {
		document.addEventListener('loadRankOutroAnimationEvent', (event) => {
			this.rankData = event.detail.rankData;
			this.updateRankPoints();
			const minScore = this.rankPoints[this.rankData.rank][0];
			const maxScore = this.rankPoints[this.rankData.rank][1];
			this.colorPercentage = (this.rankData.old_rank_points - minScore) /  (maxScore - minScore) * 100;
			console.log(this.colorPercentage);

			// this.updateBackgroundOpacity();
		});
	}


	drawRankOutro() {
		this.deltaTime = (performance.now() - this.lastTime) / 1000;
		this.drawBackground();
		// if (this.isResultDrawable)
		// this.drawTitle();
		// this.drawRank(this.canvas.width / 2, this.canvas.height / 2, this.rankImages[this.rankData.rank]);
		this.drawRankPoints();
		this.drawRankBar(this.canvas.width / 2, this.canvas.height / 2);
	}


	drawBackground() {
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = `rgba(0, 0, 0, 0.75)`;
		this.canvas.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas.ctx.closePath();
	}


	drawTitle() {
		// if (this.isSparksDrawable)
		// 	this.drawSparks();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.fillStyle = '#EDEDF1';
		this.canvas.ctx.font = `bold 100px Poppins`;
		this.canvas.ctx.textAlign = 'center';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(`${this.rankData.rank.toUpperCase()}` , this.canvas.width / 2, this.canvas.height / 2);
		this.canvas.ctx.closePath();
	}


	drawRank(x, y, img) {
		const imgWidth = 365;
		const imgHeight = 250;

		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		this.canvas.ctx.shadowBlur = 50;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.drawImage(img, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
		this.canvas.ctx.closePath();
		this.canvas.ctx.restore();
	}


	drawRankBar(x, y) {
		const width = 500;
		const height = 30;
		const radius = 10;
		const colorWidth = this.colorPercentage * width / 100;

		x -= width / 2;
		y -= height / 2;

		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x + radius, y);
		this.canvas.ctx.lineTo(x + colorWidth - radius, y);
		this.canvas.ctx.arcTo(x + colorWidth, y, x + colorWidth, y + radius, radius);
		this.canvas.ctx.lineTo(x + colorWidth, y + height - radius);
		this.canvas.ctx.arcTo(x + colorWidth, y + height, x + colorWidth - radius, y + height, radius);
		this.canvas.ctx.lineTo(x + radius, y + height);
		this.canvas.ctx.arcTo(x, y + height, x, y + height - radius, radius);
		this.canvas.ctx.lineTo(x, y + radius);
		this.canvas.ctx.arcTo(x, y, x + radius, y, radius);

		this.canvas.ctx.fillStyle = this.rankColors[this.rankData.rank];
		this.canvas.ctx.fill();
		this.canvas.ctx.closePath();

		this.canvas.ctx.beginPath();
		this.canvas.ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
		this.canvas.ctx.moveTo(x + radius, y);
		this.canvas.ctx.lineTo(x + width - radius, y);
		this.canvas.ctx.arcTo(x + width, y, x + width, y + radius, radius);
		this.canvas.ctx.lineTo(x + width, y + height - radius);
		this.canvas.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
		this.canvas.ctx.lineTo(x + radius, y + height);
		this.canvas.ctx.arcTo(x, y + height, x, y + height - radius, radius);
		this.canvas.ctx.lineTo(x, y + radius);
		this.canvas.ctx.arcTo(x, y, x + radius, y, radius);
		this.canvas.ctx.lineWidth = 2;
		this.canvas.ctx.stroke();
		this.canvas.ctx.closePath();

	}


	drawRankPoints() {
		const imgWidth = 80;
		const imgHeight = 50;

		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		this.canvas.ctx.shadowBlur = 50;
		this.canvas.ctx.shadowOffsetX = 0;
		this.canvas.ctx.shadowOffsetY = 0;
		this.canvas.ctx.drawImage(this.rpImage, this.canvas.width / 2 - imgWidth - 7, this.canvas.height / 2 + 250 - imgHeight / 2, imgWidth, imgHeight);

		this.canvas.ctx.fillStyle = '#EDEDF1';
		this.canvas.ctx.font = `500 50px Poppins`;
		this.canvas.ctx.textAlign = 'left';
		this.canvas.ctx.textBaseline = 'middle';
		this.canvas.ctx.fillText(`${this.rankData.old_rank_points}` , this.canvas.width / 2 + 7, this.canvas.height / 2 + 257);

		this.canvas.ctx.closePath();
		this.canvas.ctx.restore();
	}


	updateRankPoints() {
		this.intervalId = setInterval(
			(this.rankData.old_rank_points < this.rankData.new_rank_points) ? this.increaseRankPoints.bind(this) : this.decreaseRankPoints.bind(this),
			35);
	}

	increaseRankPoints() {
		console.log(this.rankData)
		this.rankData.old_rank_points++;
		if (this.rankData.old_rank_points === this.rankData.new_rank_points)
			clearInterval(this.intervalId);
	}

	decreaseRankPoints() {
		console.log(this.rankData)
		this.rankData.old_rank_points--;
		if (this.rankData.old_rank_points === this.rankData.new_rank_points)
			clearInterval(this.intervalId);
	}

	//
	// updateBackgroundOpacity() {
	// 	const intervalId = setInterval(() => {
	// 		this.backgroundOpacity += 0.01;
	// 		if (this.backgroundOpacity >= 0.75) {
	// 			this.waitToDrawResult();
	// 			clearInterval(intervalId);
	// 		}
	// 	}, 7);
	// }


	// waitToDrawResult() {
	// 	setTimeout(() => {
	// 		this.isResultDrawable = true;
	// 		this.updateResult();
	// 	}, 750);
	// }


	// Need refactor
	// updateResult() {
	// 	const intervalId = setInterval(() => {
	// 		if (this.resultFontSize > 180) {
	// 			this.resultFontSize -= 30;
	// 		} else if (this.isWin) {
	// 			if (this.isWin)
	// 				this.generateSparks(this.canvas.width / 2, this.canvas.height / 2);
	// 			this.isSparksDrawable = true;
	// 			clearInterval(intervalId);
	// 		} else {
	// 			clearInterval(intervalId);
	// 		}
	// 	}, 10);
	// }

	//
	// drawSparks() {
	// 	for (let i = 0; i < this.sparks.length; i++) {
	// 		this.sparks[i].update(this.deltaTime);
	//
	// 		this.sparks[i].draw(this.canvas.ctx);
	// 		if (!this.sparks[i].isAlive())
	// 			this.sparks.splice(i, 1);
	// 	}
	// }
	//
	// generateSparks(x, y) {
	// 	console.log('sparks')
	// 	const numberOfSparks = 350;
	// 	const angleRange = [0, 2 * Math.PI];
	//
	// 	for (let i = 0; i < numberOfSparks; i++) {
	// 		const angle = angleRange[0] + Math.random() * (angleRange[1] - angleRange[0]);
	// 		const speed = 20 + Math.random() * 50;
	// 		const lifetime = 3 + Math.random() * 2;
	//
	// 		let color = (i % 2 === 0) ? "rgb(255, 165, 0)" : "#00ceff";
	//
	// 		let spark = new Spark(x, y, angle, speed, lifetime, this.deltaTime, 5, color);
	// 		this.sparks.push(spark);
	// 	}
	// }

}